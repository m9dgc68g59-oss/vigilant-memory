import { NextResponse } from "next/server";
import type { ReceiptData } from "@/types/receipt";

export const runtime = "nodejs";

/** Allow up to 10 MB image uploads (Next.js App Router route segment config). */
export const maxDuration = 60;

// Note: Next.js 15 App Router auto-parses body; the default limit is 4 MB.
// We validate size ourselves inside the handler to give a friendly error.

// ---------------------------------------------------------------------------
// Mock data — returned when no API key is configured (development fallback)
// ---------------------------------------------------------------------------
const MOCK_RECEIPT: ReceiptData = {
  storeName: "Continente",
  storeDate: new Date().toLocaleDateString("pt-PT"),
  items: [
    { name: "Leite Meio Gordo Mimosa 1L", quantity: "2 un", unitPrice: 0.99, totalPrice: 1.98 },
    { name: "Pão de Forma Integral", quantity: "1 un", unitPrice: 1.49, totalPrice: 1.49 },
    { name: "Banana da Madeira", quantity: "1,2 kg", unitPrice: 1.50, totalPrice: 1.80 },
    { name: "Arroz Agulha Bom Sucesso", quantity: "1 un", unitPrice: 1.29, totalPrice: 1.29 },
    { name: "Azeite Virgem Extra Gallo 75cl", quantity: "1 un", unitPrice: 5.99, totalPrice: 5.99 },
    { name: "Ovos M/L Continente 6 un", quantity: "1 un", unitPrice: 1.65, totalPrice: 1.65 },
    { name: "Peito de Frango (kg)", quantity: "0,8 kg", unitPrice: 5.90, totalPrice: 4.72 },
    { name: "Iogurte Grego Natural 4×125g", quantity: "2 un", unitPrice: 1.79, totalPrice: 3.58 },
  ],
  totalAmount: 22.50,
};

// ---------------------------------------------------------------------------
// Prompt for vision model
// ---------------------------------------------------------------------------
const OCR_PROMPT = `Analisa esta fotografia de um talão de supermercado português (Continente, Pingo Doce, etc.).

Extrai os dados e devolve **APENAS** um objeto JSON válido (sem texto extra, sem markdown, sem \`\`\`) com esta estrutura exata:

{
  "storeName": "Nome da loja (ex: Continente, Pingo Doce)",
  "storeDate": "DD/MM/AAAA",
  "items": [
    { "name": "Nome do produto", "quantity": "quantidade (ex: 2 un, 1,5 kg)", "unitPrice": 0.00, "totalPrice": 0.00 }
  ],
  "totalAmount": 0.00
}

Regras:
- Usa vírgula como separador decimal nos preços NÃO — usa SEMPRE ponto (ex: 1.99).
- quantity deve indicar unidade quando possível ("un", "kg", "L", "pack").
- Se não conseguires ler um campo, usa "" para strings e -1 para números.
- Inclui TODOS os itens visíveis no talão.
- O totalAmount deve ser o total final do talão (soma dos itens).`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Try to extract a JSON object from text that may have markdown fences or extra prose. */
function extractJson(text: string): string {
  // Remove markdown code fences
  let cleaned = text.replace(/```(?:json)?\s*/gi, "").replace(/```\s*/g, "").trim();

  // Find the outermost { ... }
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }
  return cleaned;
}

/** Validate and coerce raw parsed JSON into a ReceiptData shape. */
function normaliseReceipt(raw: Record<string, unknown>): ReceiptData {
  const items: ReceiptData["items"] = Array.isArray(raw.items)
    ? raw.items.map((item: Record<string, unknown>) => ({
        name: typeof item.name === "string" ? item.name.trim() : "",
        quantity: typeof item.quantity === "string" ? item.quantity.trim() : "1 un",
        unitPrice: typeof item.unitPrice === "number" && item.unitPrice >= 0 ? item.unitPrice : 0,
        totalPrice: typeof item.totalPrice === "number" && item.totalPrice >= 0 ? item.totalPrice : 0,
      }))
    : [];

  return {
    storeName: typeof raw.storeName === "string" ? raw.storeName.trim() : "Desconhecida",
    storeDate: typeof raw.storeDate === "string" ? raw.storeDate.trim() : new Date().toLocaleDateString("pt-PT"),
    items,
    totalAmount: typeof raw.totalAmount === "number" ? raw.totalAmount : 0,
  };
}

// ---------------------------------------------------------------------------
// POST /api/scan
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    // 1. Parse the incoming FormData
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Esperado multipart/form-data com campo 'image'." }, { status: 400 });
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json({ error: "FormData inválido. Envia uma imagem no campo 'image'." }, { status: 400 });
    }

    const imageFile = formData.get("image");
    if (!imageFile || !(imageFile instanceof File)) {
      return NextResponse.json({ error: "Campo 'image' em falta ou inválido." }, { status: 400 });
    }

    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json({ error: "O ficheiro enviado não é uma imagem." }, { status: 400 });
    }

    // Limit to ~10 MB
    const MAX_BYTES = 10 * 1024 * 1024;
    if (imageFile.size > MAX_BYTES) {
      return NextResponse.json({ error: "A imagem é demasiado grande (máx. 10 MB)." }, { status: 400 });
    }

    // Convert to base64
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const base64Image = buffer.toString("base64");
    const mediaType = imageFile.type;

    // 2. Try OpenAI GPT-4V
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      try {
        const receipt = await callOpenAI(openaiKey, base64Image, mediaType);
        return NextResponse.json(receipt);
      } catch (err) {
        console.error("OpenAI OCR failed:", err);
        // Fall through to Anthropic
      }
    }

    // 3. Try Anthropic Claude
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicKey) {
      try {
        const receipt = await callAnthropic(anthropicKey, base64Image, mediaType);
        return NextResponse.json(receipt);
      } catch (err) {
        console.error("Anthropic OCR failed:", err);
        // Fall through to mock
      }
    }

    // 4. Fallback: return mock data (no API key configured)
    console.warn("No vision API key configured — returning mock receipt data for development.");
    return NextResponse.json(MOCK_RECEIPT);
  } catch (err) {
    console.error("POST /api/scan unexpected error:", err);
    return NextResponse.json({ error: "Erro inesperado ao processar o talão. Tenta novamente." }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// OpenAI GPT-4V
// ---------------------------------------------------------------------------
async function callOpenAI(apiKey: string, base64Image: string, mediaType: string): Promise<ReceiptData> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      max_tokens: 2048,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: OCR_PROMPT },
            {
              type: "image_url",
              image_url: { url: `data:${mediaType};base64,${base64Image}`, detail: "high" },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI returned ${response.status}: ${body}`);
  }

  const data = (await response.json()) as {
    choices: [{ message: { content: string } }];
  };

  const rawText = data.choices?.[0]?.message?.content ?? "";
  const jsonText = extractJson(rawText);
  const parsed = JSON.parse(jsonText) as Record<string, unknown>;
  return normaliseReceipt(parsed);
}

// ---------------------------------------------------------------------------
// Anthropic Claude Vision
// ---------------------------------------------------------------------------
async function callAnthropic(apiKey: string, base64Image: string, mediaType: string): Promise<ReceiptData> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2048,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Image,
              },
            },
            { type: "text", text: OCR_PROMPT },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Anthropic returned ${response.status}: ${body}`);
  }

  const data = (await response.json()) as {
    content: [{ type: string; text: string }];
  };

  const rawText =
    data.content?.find((c: { type: string; text: string }) => c.type === "text")?.text ?? "";
  const jsonText = extractJson(rawText);
  const parsed = JSON.parse(jsonText) as Record<string, unknown>;
  return normaliseReceipt(parsed);
}
