"use client";

import { useState } from "react";
import Logo from "@/components/Logo";
import BottomNav from "@/components/BottomNav";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

interface Purchase {
  id: string;
  storeName: string;
  date: string;
  total: number;
  potentialSavings: number;
  itemCount: number;
  topItem: string;
  monthKey: string;
}

const allPurchases: Purchase[] = [
  {
    id: "p1",
    storeName: "Continente",
    date: "28/10/2026",
    total: 52.3,
    potentialSavings: 7.8,
    itemCount: 14,
    topItem: "Azeite Virgem Extra Gallo 75cl",
    monthKey: "2026-10",
  },
  {
    id: "p2",
    storeName: "Pingo Doce",
    date: "15/10/2026",
    total: 38.75,
    potentialSavings: 3.2,
    itemCount: 9,
    topItem: "Peito de Frango (kg)",
    monthKey: "2026-10",
  },
  {
    id: "p3",
    storeName: "Continente",
    date: "22/09/2026",
    total: 67.9,
    potentialSavings: 11.5,
    itemCount: 21,
    topItem: "Iogurte Grego Natural 4×125g",
    monthKey: "2026-09",
  },
  {
    id: "p4",
    storeName: "Continente",
    date: "08/09/2026",
    total: 43.2,
    potentialSavings: 5.6,
    itemCount: 11,
    topItem: "Arroz Agulha Bom Sucesso 1kg",
    monthKey: "2026-09",
  },
  {
    id: "p5",
    storeName: "Pingo Doce",
    date: "31/08/2026",
    total: 55.1,
    potentialSavings: 4.3,
    itemCount: 16,
    topItem: "Leite Meio Gordo Mimosa 1L",
    monthKey: "2026-08",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const monthLabels: Record<string, string> = {
  "01": "Janeiro",
  "02": "Fevereiro",
  "03": "Março",
  "04": "Abril",
  "05": "Maio",
  "06": "Junho",
  "07": "Julho",
  "08": "Agosto",
  "09": "Setembro",
  "10": "Outubro",
  "11": "Novembro",
  "12": "Dezembro",
};

function groupByMonth(purchases: Purchase[]): Map<string, Purchase[]> {
  const map = new Map<string, Purchase[]>();
  for (const p of purchases) {
    const existing = map.get(p.monthKey) ?? [];
    existing.push(p);
    map.set(p.monthKey, existing);
  }
  return new Map([...map.entries()].sort((a, b) => b[0].localeCompare(a[0])));
}

function formatMonthLabel(key: string): string {
  const [, mm] = key.split("-");
  return `${monthLabels[mm] ?? mm} de ${key.split("-")[0]}`;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function HistoricoPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const grouped = groupByMonth(allPurchases);
  const isEmpty = allPurchases.length === 0;

  return (
    <>
      <header className="px-5 pt-5">
        <Logo />
        <p className="mt-0.5 text-[13px] text-gray-500">Histórico de compras</p>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-4">
        {isEmpty && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-10 w-10 text-gray-400"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h2 className="mb-1 text-lg font-semibold text-gray-700">Nenhuma compra ainda</h2>
            <p className="text-sm text-gray-500">
              Digitaliza o teu primeiro talão para começar a poupar.
            </p>
          </div>
        )}

        {!isEmpty &&
          [...grouped.entries()].map(([monthKey, purchases]) => (
            <div key={monthKey} className="mb-5">
              <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                {formatMonthLabel(monthKey)}
              </h2>

              <ul className="flex flex-col gap-2">
                {purchases.map((p) => {
                  const isExpanded = expandedId === p.id;

                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : p.id)}
                        className="w-full rounded-xl border-[1.5px] border-gray-200 bg-white px-4 py-3 text-left transition-all hover:border-gray-300 hover:shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <p className="flex items-center gap-2 text-[13px] font-semibold text-gray-900">
                              {p.storeName}
                              {p.storeName === "Continente" && (
                                <span className="rounded-full bg-red-50 px-1.5 py-px text-[10px] font-medium text-red-600">
                                  C
                                </span>
                              )}
                              {p.storeName === "Pingo Doce" && (
                                <span className="rounded-full bg-blue-50 px-1.5 py-px text-[10px] font-medium text-blue-600">
                                  PD
                                </span>
                              )}
                            </p>
                            <p className="mt-0.5 text-[11px] text-gray-500">
                              {p.date} · {p.itemCount} itens
                            </p>
                          </div>

                          <div className="flex items-center gap-2 text-right">
                            <div>
                              <p className="text-[15px] font-extrabold text-gray-900">
                                {p.total.toFixed(2).replace(".", ",")}€
                              </p>
                              {p.potentialSavings > 0 && (
                                <p className="text-[11px] font-semibold text-primary">
                                  −{p.potentialSavings.toFixed(2).replace(".", ",")}€ possíveis
                                </p>
                              )}
                            </div>
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                            >
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="mt-3 border-t border-gray-100 pt-3">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                              <span className="text-[12px] text-gray-500">Loja</span>
                              <span className="text-[12px] font-medium text-gray-900">{p.storeName}</span>

                              <span className="text-[12px] text-gray-500">Data</span>
                              <span className="text-[12px] font-medium text-gray-900">{p.date}</span>

                              <span className="text-[12px] text-gray-500">Itens</span>
                              <span className="text-[12px] font-medium text-gray-900">{p.itemCount}</span>

                              <span className="text-[12px] text-gray-500">Total pago</span>
                              <span className="text-[12px] font-bold text-gray-900">
                                {p.total.toFixed(2).replace(".", ",")}€
                              </span>

                              <span className="text-[12px] text-gray-500">Poupança possível</span>
                              <span className="text-[12px] font-bold text-primary">
                                {p.potentialSavings.toFixed(2).replace(".", ",")}€
                              </span>

                              <span className="text-[12px] text-gray-500">Produto destaque</span>
                              <span className="text-[12px] font-medium text-gray-900 truncate">{p.topItem}</span>
                            </div>
                          </div>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-2 flex items-center justify-end gap-2 text-[12px] text-gray-500">
                <span>Total do mês:</span>
                <span className="font-bold text-gray-700">
                  {purchases
                    .reduce((s, p) => s + p.total, 0)
                    .toFixed(2)
                    .replace(".", ",")}
                  €
                </span>
              </div>
            </div>
          ))}
      </main>

      <BottomNav currentPage="historico" />
    </>
  );
}
