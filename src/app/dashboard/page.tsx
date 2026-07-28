"use client";

import Logo from "@/components/Logo";
import BottomNav from "@/components/BottomNav";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

interface MonthlySpend {
  month: string;
  paid: number;
  couldHavePaid: number;
}

interface ProductTrend {
  name: string;
  prices: { month: string; price: number }[];
  trend: "up" | "down" | "flat";
}

const monthlySpending: MonthlySpend[] = [
  { month: "Jul", paid: 178.5, couldHavePaid: 152.3 },
  { month: "Ago", paid: 192.3, couldHavePaid: 163.8 },
  { month: "Set", paid: 145.2, couldHavePaid: 127.1 },
  { month: "Out", paid: 166.8, couldHavePaid: 142.6 },
];

const totalPaid = monthlySpending.reduce((s, m) => s + m.paid, 0);
const totalCouldHavePaid = monthlySpending.reduce((s, m) => s + m.couldHavePaid, 0);
const lostSavings = totalPaid - totalCouldHavePaid;

const maxPaid = Math.max(...monthlySpending.map((m) => m.paid));

const recurringProducts: ProductTrend[] = [
  {
    name: "Leite Meio Gordo Mimosa 1L",
    prices: [
      { month: "Jul", price: 0.99 },
      { month: "Ago", price: 0.99 },
      { month: "Set", price: 1.05 },
      { month: "Out", price: 1.05 },
    ],
    trend: "up",
  },
  {
    name: "Pão de Forma Integral 500g",
    prices: [
      { month: "Jul", price: 1.49 },
      { month: "Ago", price: 1.49 },
      { month: "Set", price: 1.39 },
      { month: "Out", price: 1.39 },
    ],
    trend: "down",
  },
  {
    name: "Arroz Agulha Bom Sucesso 1kg",
    prices: [
      { month: "Jul", price: 1.29 },
      { month: "Ago", price: 1.29 },
      { month: "Set", price: 1.29 },
      { month: "Out", price: 1.29 },
    ],
    trend: "flat",
  },
  {
    name: "Peito de Frango (kg)",
    prices: [
      { month: "Jul", price: 5.49 },
      { month: "Ago", price: 5.59 },
      { month: "Set", price: 5.79 },
      { month: "Out", price: 5.79 },
    ],
    trend: "up",
  },
  {
    name: "Azeite Virgem Extra Gallo 75cl",
    prices: [
      { month: "Jul", price: 5.99 },
      { month: "Ago", price: 6.29 },
      { month: "Set", price: 6.49 },
      { month: "Out", price: 6.49 },
    ],
    trend: "up",
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TrendIcon({ trend }: { trend: "up" | "down" | "flat" }) {
  if (trend === "up") {
    return (
      <span className="ml-1.5 inline-flex items-center text-[13px] font-bold text-red-500" title="Preço a subir">
        ↑
      </span>
    );
  }
  if (trend === "down") {
    return (
      <span className="ml-1.5 inline-flex items-center text-[13px] font-bold text-green-600" title="Preço a descer">
        ↓
      </span>
    );
  }
  return (
    <span className="ml-1.5 inline-flex items-center text-[13px] font-bold text-gray-400" title="Preço estável">
      →
    </span>
  );
}

function MiniPriceChart({ prices }: { prices: { month: string; price: number }[] }) {
  const vals = prices.map((p) => p.price);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;

  return (
    <div className="mt-1.5 flex items-end gap-[3px]">
      {prices.map((p, i) => {
        const h = 8 + ((p.price - min) / range) * 18;
        const isLast = i === prices.length - 1;
        return (
          <div key={p.month} className="flex flex-col items-center gap-0.5">
            <div
              className="w-[6px] rounded-sm"
              style={{
                height: `${h}px`,
                background:
                  isLast && vals[vals.length - 1] > vals[0]
                    ? "#ef5350"
                    : isLast
                      ? "#66bb6a"
                      : "#2E7D32",
              }}
            />
            <span className="text-[9px] leading-none text-gray-400">{p.month}</span>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  return (
    <>
      <header className="px-5 pt-5">
        <Logo />
        <p className="mt-0.5 text-[13px] text-gray-500">O teu resumo de poupanças</p>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-4">
        {/* ── Section 1: Monthly spending bar chart ─────────────────────── */}
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Gasto mensal
        </h2>
        <div className="mb-6 rounded-2xl border-[1.5px] border-gray-200 bg-gray-50 px-4 py-4">
          <div className="flex items-end justify-between gap-2" style={{ height: 140 }}>
            {monthlySpending.map((m) => {
              const hPct = (m.paid / maxPaid) * 100;
              return (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-gray-700">
                    {m.paid.toFixed(0).replace(".", ",")}€
                  </span>
                  <div className="relative w-full max-w-[52px] flex-1 rounded-t-lg bg-gray-200">
                    <div
                      className="absolute bottom-0 w-full rounded-t-lg bg-primary transition-all"
                      style={{ height: `${hPct}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-500">{m.month}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-gray-500">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary" /> Pago
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-gray-200" /> Total
            </span>
          </div>
        </div>

        {/* ── Section 2: Paid vs Could have paid ────────────────────────── */}
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Comparação
        </h2>

        <div className="mb-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border-[1.5px] border-gray-200 bg-gray-100 px-4 py-4 text-center">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Total pago
            </p>
            <p className="text-[26px] font-extrabold tracking-tight text-gray-800">
              {totalPaid.toFixed(0).replace(".", ",")}€
            </p>
            <p className="mt-0.5 text-[11px] text-gray-400">4 compras</p>
          </div>

          <div className="rounded-2xl border-[1.5px] border-green-200 bg-primary-light px-4 py-4 text-center">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
              Poderia ter pago
            </p>
            <p className="text-[26px] font-extrabold tracking-tight text-primary">
              {totalCouldHavePaid.toFixed(0).replace(".", ",")}€
            </p>
            <p className="mt-0.5 text-[11px] text-primary-accent">noutra loja</p>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 border-[1.5px] border-red-200 px-5 py-3.5">
          <span className="text-[13px] font-semibold text-red-600">Poupança perdida:</span>
          <span className="text-[22px] font-extrabold text-red-700 tracking-tight">
            {lostSavings.toFixed(0).replace(".", ",")}€
          </span>
          <span className="text-lg">😟</span>
        </div>

        {/* ── Section 3: Recurring products with price trends ───────────── */}
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Produtos recorrentes
        </h2>

        <ul className="flex flex-col gap-2.5 pb-2">
          {recurringProducts.map((product) => {
            const firstPrice = product.prices[0].price;
            const lastPrice = product.prices[product.prices.length - 1].price;
            const priceDiff = lastPrice - firstPrice;

            return (
              <li key={product.name} className="rounded-xl border-[1.5px] border-gray-100 bg-gray-50 px-3.5 py-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-gray-900">
                      {product.name}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[11px] text-gray-500">
                        {firstPrice.toFixed(2).replace(".", ",")}€ →{" "}
                        {lastPrice.toFixed(2).replace(".", ",")}€
                      </span>
                      {priceDiff > 0 && (
                        <span className="rounded-full bg-red-100 px-1.5 py-px text-[10px] font-bold text-red-600">
                          +{priceDiff.toFixed(2).replace(".", ",")}€
                        </span>
                      )}
                      {priceDiff < 0 && (
                        <span className="rounded-full bg-green-100 px-1.5 py-px text-[10px] font-bold text-green-700">
                          {priceDiff.toFixed(2).replace(".", ",")}€
                        </span>
                      )}
                      {priceDiff === 0 && (
                        <span className="rounded-full bg-gray-100 px-1.5 py-px text-[10px] font-bold text-gray-500">
                          estável
                        </span>
                      )}
                      <TrendIcon trend={product.trend} />
                    </div>
                  </div>
                  <MiniPriceChart prices={product.prices} />
                </div>
              </li>
            );
          })}
        </ul>
      </main>

      <BottomNav currentPage="profile" />
    </>
  );
}
