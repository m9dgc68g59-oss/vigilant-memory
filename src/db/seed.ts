/**
 * Seed script: Popula a tabela reference_prices com ~50 produtos comuns
 * e os seus preços no Continente e Pingo Doce (preços realistas PT 2026).
 *
 * Executar: npx tsx src/db/seed.ts
 * Requer DATABASE_URL no ambiente.
 */

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { referencePrices } from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

interface SeedProduct {
  productName: string;
  unit: string;
  priceContinente: number;
  pricePingoDoce: number;
}

const products: SeedProduct[] = [
  // ── Laticínios ──────────────────────────────────────────
  { productName: "Leite Meio Gordo Mimosa 1L", unit: "1L", priceContinente: 0.99, pricePingoDoce: 0.89 },
  { productName: "Leite Magro Mimosa 1L", unit: "1L", priceContinente: 0.95, pricePingoDoce: 0.85 },
  { productName: "Iogurte Grego Natural 4×125g", unit: "4×125g", priceContinente: 1.79, pricePingoDoce: 1.43 },
  { productName: "Iogurte Líquido Mimosa Morango", unit: "un", priceContinente: 1.49, pricePingoDoce: 1.39 },
  { productName: "Queijo Flamengo Fatiado 200g", unit: "200g", priceContinente: 2.49, pricePingoDoce: 2.29 },
  { productName: "Manteiga com Sal 250g", unit: "250g", priceContinente: 2.19, pricePingoDoce: 1.99 },
  { productName: "Queijo Fresco 3×50g", unit: "3×50g", priceContinente: 1.99, pricePingoDoce: 1.79 },
  { productName: "Natas UHT 200ml", unit: "200ml", priceContinente: 0.85, pricePingoDoce: 0.79 },

  // ── Padaria / Pequeno-almoço ────────────────────────────
  { productName: "Pão de Forma Integral 500g", unit: "500g", priceContinente: 1.49, pricePingoDoce: 1.39 },
  { productName: "Pão de Forma Branco 500g", unit: "500g", priceContinente: 1.29, pricePingoDoce: 1.19 },
  { productName: "Croissant Embalado 6 un", unit: "6 un", priceContinente: 2.19, pricePingoDoce: 1.99 },
  { productName: "Cereais Corn Flakes 500g", unit: "500g", priceContinente: 1.99, pricePingoDoce: 1.79 },

  // ── Mercearia ────────────────────────────────────────────
  { productName: "Arroz Agulha Bom Sucesso 1kg", unit: "1kg", priceContinente: 1.29, pricePingoDoce: 1.19 },
  { productName: "Arroz Carolino 1kg", unit: "1kg", priceContinente: 1.39, pricePingoDoce: 1.29 },
  { productName: "Massa Esparguete 500g", unit: "500g", priceContinente: 0.89, pricePingoDoce: 0.79 },
  { productName: "Massa Penne 500g", unit: "500g", priceContinente: 0.89, pricePingoDoce: 0.79 },
  { productName: "Azeite Virgem Extra Gallo 75cl", unit: "75cl", priceContinente: 5.99, pricePingoDoce: 4.79 },
  { productName: "Azeite Oliveira da Serra 75cl", unit: "75cl", priceContinente: 6.49, pricePingoDoce: 5.99 },
  { productName: "Óleo Girassol Fula 1L", unit: "1L", priceContinente: 2.39, pricePingoDoce: 2.19 },
  { productName: "Feijão Enlatado Compal 390g", unit: "390g", priceContinente: 0.99, pricePingoDoce: 0.89 },
  { productName: "Grão de Bico Compal 390g", unit: "390g", priceContinente: 0.95, pricePingoDoce: 0.85 },
  { productName: "Atum Posta Bom Petisco 120g", unit: "120g", priceContinente: 1.99, pricePingoDoce: 1.59 },
  { productName: "Molho Tomate Compal 340g", unit: "340g", priceContinente: 1.09, pricePingoDoce: 0.99 },
  { productName: "Sal Refinado 1kg", unit: "1kg", priceContinente: 0.55, pricePingoDoce: 0.49 },
  { productName: "Açúcar Branco 1kg", unit: "1kg", priceContinente: 1.09, pricePingoDoce: 0.99 },
  { productName: "Farinha de Trigo 1kg", unit: "1kg", priceContinente: 0.69, pricePingoDoce: 0.59 },
  { productName: "Batata Frita Palha 200g", unit: "200g", priceContinente: 1.89, pricePingoDoce: 1.69 },
  { productName: "Bolacha Maria 400g", unit: "400g", priceContinente: 1.49, pricePingoDoce: 1.29 },

  // ── Proteína ─────────────────────────────────────────────
  { productName: "Peito de Frango (kg)", unit: "kg", priceContinente: 5.90, pricePingoDoce: 4.99 },
  { productName: "Costeleta de Porco (kg)", unit: "kg", priceContinente: 5.49, pricePingoDoce: 4.99 },
  { productName: "Carne Picada Mista (kg)", unit: "kg", priceContinente: 6.99, pricePingoDoce: 5.99 },
  { productName: "Pescada Filetes Congelada 400g", unit: "400g", priceContinente: 4.49, pricePingoDoce: 3.99 },
  { productName: "Salmão Posta Congelado 250g", unit: "250g", priceContinente: 5.99, pricePingoDoce: 5.49 },

  // ── Frutas e Vegetais ────────────────────────────────────
  { productName: "Banana da Madeira (kg)", unit: "kg", priceContinente: 1.49, pricePingoDoce: 1.29 },
  { productName: "Maçã Golden (kg)", unit: "kg", priceContinente: 2.29, pricePingoDoce: 1.99 },
  { productName: "Tomate (kg)", unit: "kg", priceContinente: 2.49, pricePingoDoce: 2.29 },
  { productName: "Cebola (kg)", unit: "kg", priceContinente: 1.39, pricePingoDoce: 1.19 },
  { productName: "Batata (kg)", unit: "kg", priceContinente: 1.29, pricePingoDoce: 0.99 },
  { productName: "Alface 1 un", unit: "un", priceContinente: 1.29, pricePingoDoce: 0.99 },
  { productName: "Cenoura (kg)", unit: "kg", priceContinente: 1.49, pricePingoDoce: 1.29 },
  { productName: "Laranja (kg)", unit: "kg", priceContinente: 1.69, pricePingoDoce: 1.49 },

  // ── Bebidas ─────────────────────────────────────────────
  { productName: "Água Mineral 1.5L 6 un", unit: "6×1.5L", priceContinente: 2.99, pricePingoDoce: 2.49 },
  { productName: "Coca-Cola 1.5L", unit: "1.5L", priceContinente: 2.39, pricePingoDoce: 2.19 },
  { productName: "Cerveja Super Bock 33cl 6 un", unit: "6×33cl", priceContinente: 5.49, pricePingoDoce: 4.99 },
  { productName: "Vinho Tinto Monte Velho 75cl", unit: "75cl", priceContinente: 4.99, pricePingoDoce: 4.49 },
  { productName: "Sumo Compal Laranja 1L", unit: "1L", priceContinente: 1.49, pricePingoDoce: 1.29 },
  { productName: "Café Torrado Delta 250g", unit: "250g", priceContinente: 3.99, pricePingoDoce: 3.49 },

  // ── Limpeza e Casa ──────────────────────────────────────
  { productName: "Detergente Roupa Skip 36 doses", unit: "36 doses", priceContinente: 8.99, pricePingoDoce: 7.99 },
  { productName: "Lava-Louça Fairy 500ml", unit: "500ml", priceContinente: 3.49, pricePingoDoce: 2.99 },
  { productName: "Papel Higiénico Renova 12 rolos", unit: "12 rolos", priceContinente: 5.99, pricePingoDoce: 4.99 },
  { productName: "Guardanapos 100 un", unit: "100 un", priceContinente: 1.49, pricePingoDoce: 1.29 },
  { productName: "Lixívia 1L", unit: "1L", priceContinente: 0.79, pricePingoDoce: 0.69 },
];

async function seed() {
  console.log(`🌱 A inserir ${products.length * 2} preços de referência...`);

  const rows = products.flatMap((p) => [
    {
      productName: p.productName,
      storeName: "Continente",
      price: p.priceContinente.toFixed(2),
      unit: p.unit,
    },
    {
      productName: p.productName,
      storeName: "Pingo Doce",
      price: p.pricePingoDoce.toFixed(2),
      unit: p.unit,
    },
  ]);

  // Inserir em batches de 20
  const batchSize = 20;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    await db.insert(referencePrices).values(batch).onConflictDoNothing();
    console.log(`   ✓ Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} registos`);
  }

  console.log(`✅ Seed concluído: ${rows.length} registos inseridos.`);
  await pool.end();
}

seed().catch((e) => {
  console.error("❌ Erro no seed:", e);
  process.exit(1);
});
