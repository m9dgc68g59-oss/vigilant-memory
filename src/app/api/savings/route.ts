import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { referencePrices } from "@/db/schema";
import type { ReceiptData, ReceiptItem } from "@/types/receipt";

// ── Mock data (fallback quando DATABASE_URL não está definida) ──

interface MockPrice {
  productName: string;
  storeName: string;
  price: number;
  unit: string | null;
}

const mockPrices: MockPrice[] = [
  // Laticínios
  { productName: "Leite Meio Gordo Mimosa 1L", storeName: "Continente", price: 0.99, unit: "1L" },
  { productName: "Leite Meio Gordo Mimosa 1L", storeName: "Pingo Doce", price: 0.89, unit: "1L" },
  { productName: "Leite Magro Mimosa 1L", storeName: "Continente", price: 0.95, unit: "1L" },
  { productName: "Leite Magro Mimosa 1L", storeName: "Pingo Doce", price: 0.85, unit: "1L" },
  { productName: "Iogurte Grego Natural 4×125g", storeName: "Continente", price: 1.79, unit: "4×125g" },
  { productName: "Iogurte Grego Natural 4×125g", storeName: "Pingo Doce", price: 1.43, unit: "4×125g" },
  { productName: "Iogurte Líquido Mimosa Morango", storeName: "Continente", price: 1.49, unit: "un" },
  { productName: "Iogurte Líquido Mimosa Morango", storeName: "Pingo Doce", price: 1.39, unit: "un" },
  { productName: "Queijo Flamengo Fatiado 200g", storeName: "Continente", price: 2.49, unit: "200g" },
  { productName: "Queijo Flamengo Fatiado 200g", storeName: "Pingo Doce", price: 2.29, unit: "200g" },
  { productName: "Manteiga com Sal 250g", storeName: "Continente", price: 2.19, unit: "250g" },
  { productName: "Manteiga com Sal 250g", storeName: "Pingo Doce", price: 1.99, unit: "250g" },
  { productName: "Queijo Fresco 3×50g", storeName: "Continente", price: 1.99, unit: "3×50g" },
  { productName: "Queijo Fresco 3×50g", storeName: "Pingo Doce", price: 1.79, unit: "3×50g" },
  { productName: "Natas UHT 200ml", storeName: "Continente", price: 0.85, unit: "200ml" },
  { productName: "Natas UHT 200ml", storeName: "Pingo Doce", price: 0.79, unit: "200ml" },
  // Padaria
  { productName: "Pão de Forma Integral 500g", storeName: "Continente", price: 1.49, unit: "500g" },
  { productName: "Pão de Forma Integral 500g", storeName: "Pingo Doce", price: 1.39, unit: "500g" },
  { productName: "Pão de Forma Branco 500g", storeName: "Continente", price: 1.29, unit: "500g" },
  { productName: "Pão de Forma Branco 500g", storeName: "Pingo Doce", price: 1.19, unit: "500g" },
  { productName: "Croissant Embalado 6 un", storeName: "Continente", price: 2.19, unit: "6 un" },
  { productName: "Croissant Embalado 6 un", storeName: "Pingo Doce", price: 1.99, unit: "6 un" },
  { productName: "Cereais Corn Flakes 500g", storeName: "Continente", price: 1.99, unit: "500g" },
  { productName: "Cereais Corn Flakes 500g", storeName: "Pingo Doce", price: 1.79, unit: "500g" },
  // Mercearia
  { productName: "Arroz Agulha Bom Sucesso 1kg", storeName: "Continente", price: 1.29, unit: "1kg" },
  { productName: "Arroz Agulha Bom Sucesso 1kg", storeName: "Pingo Doce", price: 1.19, unit: "1kg" },
  { productName: "Arroz Carolino 1kg", storeName: "Continente", price: 1.39, unit: "1kg" },
  { productName: "Arroz Carolino 1kg", storeName: "Pingo Doce", price: 1.29, unit: "1kg" },
  { productName: "Massa Esparguete 500g", storeName: "Continente", price: 0.89, unit: "500g" },
  { productName: "Massa Esparguete 500g", storeName: "Pingo Doce", price: 0.79, unit: "500g" },
  { productName: "Massa Penne 500g", storeName: "Continente", price: 0.89, unit: "500g" },
  { productName: "Massa Penne 500g", storeName: "Pingo Doce", price: 0.79, unit: "500g" },
  { productName: "Azeite Virgem Extra Gallo 75cl", storeName: "Continente", price: 5.99, unit: "75cl" },
  { productName: "Azeite Virgem Extra Gallo 75cl", storeName: "Pingo Doce", price: 4.79, unit: "75cl" },
  { productName: "Azeite Oliveira da Serra 75cl", storeName: "Continente", price: 6.49, unit: "75cl" },
  { productName: "Azeite Oliveira da Serra 75cl", storeName: "Pingo Doce", price: 5.99, unit: "75cl" },
  { productName: "Óleo Girassol Fula 1L", storeName: "Continente", price: 2.39, unit: "1L" },
  { productName: "Óleo Girassol Fula 1L", storeName: "Pingo Doce", price: 2.19, unit: "1L" },
  { productName: "Feijão Enlatado Compal 390g", storeName: "Continente", price: 0.99, unit: "390g" },
  { productName: "Feijão Enlatado Compal 390g", storeName: "Pingo Doce", price: 0.89, unit: "390g" },
  { productName: "Grão de Bico Compal 390g", storeName: "Continente", price: 0.95, unit: "390g" },
  { productName: "Grão de Bico Compal 390g", storeName: "Pingo Doce", price: 0.85, unit: "390g" },
  { productName: "Atum Posta Bom Petisco 120g", storeName: "Continente", price: 1.99, unit: "120g" },
  { productName: "Atum Posta Bom Petisco 120g", storeName: "Pingo Doce", price: 1.59, unit: "120g" },
  { productName: "Molho Tomate Compal 340g", storeName: "Continente", price: 1.09, unit: "340g" },
  { productName: "Molho Tomate Compal 340g", storeName: "Pingo Doce", price: 0.99, unit: "340g" },
  { productName: "Sal Refinado 1kg", storeName: "Continente", price: 0.55, unit: "1kg" },
  { productName: "Sal Refinado 1kg", storeName: "Pingo Doce", price: 0.49, unit: "1kg" },
  { productName: "Açúcar Branco 1kg", storeName: "Continente", price: 1.09, unit: "1kg" },
  { productName: "Açúcar Branco 1kg", storeName: "Pingo Doce", price: 0.99, unit: "1kg" },
  { productName: "Farinha de Trigo 1kg", storeName: "Continente", price: 0.69, unit: "1kg" },
  { productName: "Farinha de Trigo 1kg", storeName: "Pingo Doce", price: 0.59, unit: "1kg" },
  { productName: "Batata Frita Palha 200g", storeName: "Continente", price: 1.89, unit: "200g" },
  { productName: "Batata Frita Palha 200g", storeName: "Pingo Doce", price: 1.69, unit: "200g" },
  { productName: "Bolacha Maria 400g", storeName: "Continente", price: 1.49, unit: "400g" },
  { productName: "Bolacha Maria 400g", storeName: "Pingo Doce", price: 1.29, unit: "400g" },
  // Proteína
  { productName: "Peito de Frango (kg)", storeName: "Continente", price: 5.90, unit: "kg" },
  { productName: "Peito de Frango (kg)", storeName: "Pingo Doce", price: 4.99, unit: "kg" },
  { productName: "Costeleta de Porco (kg)", storeName: "Continente", price: 5.49, unit: "kg" },
  { productName: "Costeleta de Porco (kg)", storeName: "Pingo Doce", price: 4.99, unit: "kg" },
  { productName: "Carne Picada Mista (kg)", storeName: "Continente", price: 6.99, unit: "kg" },
  { productName: "Carne Picada Mista (kg)", storeName: "Pingo Doce", price: 5.99, unit: "kg" },
  { productName: "Pescada Filetes Congelada 400g", storeName: "Continente", price: 4.49, unit: "400g" },
  { productName: "Pescada Filetes Congelada 400g", storeName: "Pingo Doce", price: 3.99, unit: "400g" },
  { productName: "Salmão Posta Congelado 250g", storeName: "Continente", price: 5.99, unit: "250g" },
  { productName: "Salmão Posta Congelado 250g", storeName: "Pingo Doce", price: 5.49, unit: "250g" },
  // Frutas e Vegetais
  { productName: "Banana da Madeira (kg)", storeName: "Continente", price: 1.49, unit: "kg" },
  { productName: "Banana da Madeira (kg)", storeName: "Pingo Doce", price: 1.29, unit: "kg" },
  { productName: "Maçã Golden (kg)", storeName: "Continente", price: 2.29, unit: "kg" },
  { productName: "Maçã Golden (kg)", storeName: "Pingo Doce", price: 1.99, unit: "kg" },
  { productName: "Tomate (kg)", storeName: "Continente", price: 2.49, unit: "kg" },
  { productName: "Tomate (kg)", storeName: "Pingo Doce", price: 2.29, unit: "kg" },
  { productName: "Cebola (kg)", storeName: "Continente", price: 1.39, unit: "kg" },
  { productName: "Cebola (kg)", storeName: "Pingo Doce", price: 1.19, unit: "kg" },
  { productName: "Batata (kg)", storeName: "Continente", price: 1.29, unit: "kg" },
  { productName: "Batata (kg)", storeName: "Pingo Doce", price: 0.99, unit: "kg" },
  { productName: "Alface 1 un", storeName: "Continente", price: 1.29, unit: "un" },
  { productName: "Alface 1 un", storeName: "Pingo Doce", price: 0.99, unit: "un" },
  { productName: "Cenoura (kg)", storeName: "Continente", price: 1.49, unit: "kg" },
  { productName: "Cenoura (kg)", storeName: "Pingo Doce", price: 1.29, unit: "kg" },
  { productName: "Laranja (kg)", storeName: "Continente", price: 1.69, unit: "kg" },
  { productName: "Laranja (kg)", storeName: "Pingo Doce", price: 1.49, unit: "kg" },
  // Bebidas
  { productName: "Água Mineral 1.5L 6 un", storeName: "Continente", price: 2.99, unit: "6×1.5L" },
  { productName: "Água Mineral 1.5L 6 un", storeName: "Pingo Doce", price: 2.49, unit: "6×1.5L" },
  { productName: "Coca-Cola 1.5L", storeName: "Continente", price: 2.39, unit: "1.5L" },
  { productName: "Coca-Cola 1.5L", storeName: "Pingo Doce", price: 2.19, unit: "1.5L" },
  { productName: "Cerveja Super Bock 33cl 6 un", storeName: "Continente", price: 5.49, unit: "6×33cl" },
  { productName: "Cerveja Super Bock 33cl 6 un", storeName: "Pingo Doce", price: 4.99, unit: "6×33cl" },
  { productName: "Vinho Tinto Monte Velho 75cl", storeName: "Continente", price: 4.99, unit: "75cl" },
  { productName: "Vinho Tinto Monte Velho 75cl", storeName: "Pingo Doce", price: 4.49, unit: "75cl" },
  { productName: "Sumo Compal Laranja 1L", storeName: "Continente", price: 1.49, unit: "1L" },
  { productName: "Sumo Compal Laranja 1L", storeName: "Pingo Doce", price: 1.29, unit: "1L" },
  { productName: "Café Torrado Delta 250g", storeName: "Continente", price: 3.99, unit: "250g" },
  { productName: "Café Torrado Delta 250g", storeName: "Pingo Doce", price: 3.49, unit: "250g" },
  // Limpeza
  { productName: "Detergente Roupa Skip 36 doses", storeName: "Continente", price: 8.99, unit: "36 doses" },
  { productName: "Detergente Roupa Skip 36 doses", storeName: "Pingo Doce", price: 7.99, unit: "36 doses" },
  { productName: "Lava-Louça Fairy 500ml", storeName: "Continente", price: 3.49, unit: "500ml" },
  { productName: "Lava-Louça Fairy 500ml", storeName: "Pingo Doce", price: 2.99, unit: "500ml" },
  { productName: "Papel Higiénico Renova 12 rolos", storeName: "Continente", price: 5.99, unit: "12 rolos" },
  { productName: "Papel Higiénico Renova 12 rolos", storeName: "Pingo Doce", price: 4.99, unit: "12 rolos" },
  { productName: "Guardanapos 100 un", storeName: "Continente", price: 1.49, unit: "100 un" },
  { productName: "Guardanapos 100 un", storeName: "Pingo Doce", price: 1.29, unit: "100 un" },
  { productName: "Lixívia 1L", storeName: "Continente", price: 0.79, unit: "1L" },
  { productName: "Lixívia 1L", storeName: "Pingo Doce", price: 0.69, unit: "1L" },
];

// ── Helpers ────────────────────────────────────────────────

/** Normaliza texto: lowercase, remove acentos, trim. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/\s+/g, " ")
    .trim();
}

/** Distância de Levenshtein para fuzzy matching em variações curtas. */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/**
 * Procura o melhor match para um nome de produto nos preços de referência.
 * Estratégia:
 *  1. Match exato após normalização
 *  2. Se o nome normalizado começa com o nome de referência (ou vice-versa)
 *  3. Fuzzy com Levenshtein (threshold: <=3 edições se string curta)
 */
function findMatch(
  queryName: string,
  prices: { productName: string; storeName: string; price: number; unit: string | null }[]
): typeof prices {
  const q = normalize(queryName);

  // 1) Exato
  const exact = prices.filter((p) => normalize(p.productName) === q);
  if (exact.length > 0) return exact;

  // 2) Prefixo/contém
  const prefix = prices.filter((p) => {
    const n = normalize(p.productName);
    return n.startsWith(q) || q.startsWith(n) || n.includes(q) || q.includes(n);
  });
  if (prefix.length > 0) return prefix;

  // 3) Fuzzy — só para strings com >= 6 chars
  if (q.length >= 6) {
    const threshold = q.length <= 12 ? 3 : 4;
    let bestScore = Infinity;
    let bestMatches: typeof prices = [];
    for (const p of prices) {
      const n = normalize(p.productName);
      const d = levenshtein(q, n);
      if (d < bestScore) {
        bestScore = d;
        bestMatches = [p];
      } else if (d === bestScore) {
        bestMatches.push(p);
      }
    }
    if (bestScore <= threshold) return bestMatches;
  }

  return [];
}

// ── Response types ────────────────────────────────────────

interface AlternativeStore {
  storeName: string;
  totalPrice: number;
}

interface SavingsInfo {
  bestStore: string;
  amount: number;
}

interface TopSaver {
  name: string;
  pricePaid: number;
  alternativePrice: number;
  store: string;
  difference: number;
}

interface SavingsResponse {
  storeName: string;
  storeDate?: string;
  totalSpent: number;
  alternatives: AlternativeStore[];
  savings: SavingsInfo | null;
  topSavers: TopSaver[];
}

// ── POST handler ──────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body: ReceiptData = await request.json();

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Nenhum item enviado" }, { status: 400 });
    }

    // Determinar fonte dos preços de referência
    let allPrices: MockPrice[];

    if (process.env.DATABASE_URL) {
      // Consultar BD real
      const dbRows = await db.select().from(referencePrices);
      allPrices = dbRows.map((r) => ({
        productName: r.productName,
        storeName: r.storeName,
        price: Number(r.price),
        unit: r.unit,
      }));
    } else {
      allPrices = mockPrices;
    }

    // Encontrar todos os stores únicos (excluindo o store do talão)
    const allStores = [...new Set(allPrices.map((p) => p.storeName))];
    const userStoreName = body.storeName || "Continente";
    const alternativeStores = allStores.filter((s) => s !== userStoreName);

    // Para cada item do talão, encontrar preços em cada loja
    interface ItemWithMatches {
      receiptItem: ReceiptItem;
      matches: { storeName: string; price: number; productName: string }[];
    }

    const itemsWithMatches: ItemWithMatches[] = body.items.map((item) => {
      const matchedPrices = findMatch(item.name, allPrices);
      return {
        receiptItem: item,
        matches: matchedPrices.map((p) => ({
          storeName: p.storeName,
          price: p.price,
          productName: p.productName,
        })),
      };
    });

    // Calcular totais por loja alternativa
    const alternatives: AlternativeStore[] = alternativeStores.map((store) => {
      let total = 0;
      for (const iwm of itemsWithMatches) {
        const matchInStore = iwm.matches.find((m) => m.storeName === store);
        if (matchInStore) {
          // Usa a quantidade se disponível, senão assume 1
          const qty = iwm.receiptItem.quantity ? parseFloat(iwm.receiptItem.quantity) : 1;
          total += matchInStore.price * (isNaN(qty) ? 1 : qty);
        } else {
          // Se não encontra match, usa o preço original como fallback
          total += iwm.receiptItem.totalPrice;
        }
      }
      return { storeName: store, totalPrice: Math.round(total * 100) / 100 };
    });

    // Calcular poupança
    let savings: SavingsInfo | null = null;
    if (alternatives.length > 0) {
      const cheapest = alternatives.reduce((best, curr) =>
        curr.totalPrice < best.totalPrice ? curr : best
      );
      const amount = Math.round((body.totalAmount - cheapest.totalPrice) * 100) / 100;
      if (amount > 0) {
        savings = { bestStore: cheapest.storeName, amount };
      }
    }

    // Top 3 saver items (maior diferença absoluta de preço unitário entre store original e melhor alternativa)
    const allSavers: TopSaver[] = [];

    for (const iwm of itemsWithMatches) {
      // Achar match no store do utilizador
      const userStoreMatch = iwm.matches.find((m) => m.storeName === userStoreName);
      // Melhor alternativa (mais barata)
      const altMatches = iwm.matches.filter((m) => m.storeName !== userStoreName);
      if (altMatches.length === 0) continue;

      const bestAlt = altMatches.reduce((best, curr) => (curr.price < best.price ? curr : best));
      const pricePaid = userStoreMatch ? userStoreMatch.price : iwm.receiptItem.unitPrice || iwm.receiptItem.totalPrice;
      const diff = Math.round((pricePaid - bestAlt.price) * 100) / 100;

      if (diff > 0) {
        allSavers.push({
          name: userStoreMatch?.productName || bestAlt.productName || iwm.receiptItem.name,
          pricePaid,
          alternativePrice: bestAlt.price,
          store: bestAlt.storeName,
          difference: diff,
        });
      }
    }

    // Ordenar por diferença decrescente e top 3
    allSavers.sort((a, b) => b.difference - a.difference);
    const topSavers = allSavers.slice(0, 3);

    // Total gasto (do talão)
    const totalSpent = body.totalAmount || body.items.reduce((sum, i) => sum + i.totalPrice, 0);

    const response: SavingsResponse = {
      storeName: userStoreName,
      storeDate: body.storeDate,
      totalSpent: Math.round(totalSpent * 100) / 100,
      alternatives,
      savings,
      topSavers,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erro na API /api/savings:", error);
    return NextResponse.json({ error: "Erro interno ao calcular poupança" }, { status: 500 });
  }
}
