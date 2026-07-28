"use client";

import { useState, useEffect, useCallback } from "react";
import Logo from "@/components/Logo";
import ProgressDots from "@/components/ProgressDots";
import BottomNav from "@/components/BottomNav";
import type { ReceiptData } from "@/types/receipt";

// ── API response types ────────────────────────────────────

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

// ── Formatting helpers ────────────────────────────────────

function fmtEur(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

function fmtStoreLabel(storeName: string): string {
  if (storeName.toLowerCase().includes("pingo")) return "Pingo Doce";
  if (storeName.toLowerCase().includes("continente")) return "Continente";
  return storeName;
}

// ── Page component ────────────────────────────────────────

export default function PoupancaPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SavingsResponse | null>(null);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  const fetchSavings = useCallback(async (receiptData: ReceiptData) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/savings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(receiptData),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: "Erro desconhecido" }));
        throw new Error(errBody.error || `Erro ${res.status}`);
      }

      const savingsData: SavingsResponse = await res.json();
      setData(savingsData);
    } catch (e) {
      console.error("Erro ao calcular poupança:", e);
      setError(e instanceof Error ? e.message : "Erro ao calcular poupança");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("poupaja-current-receipt");
      if (!raw) {
        setError("Nenhum talão encontrado. Digitaliza um talão primeiro.");
        setLoading(false);
        return;
      }

      const parsed: ReceiptData = JSON.parse(raw);
      if (!parsed.items || !Array.isArray(parsed.items) || parsed.items.length === 0) {
        setError("O talão não tem itens. Volta a digitalizar.");
        setLoading(false);
        return;
      }

      setReceipt(parsed);
      fetchSavings(parsed);
    } catch {
      setError("Erro ao ler os dados do talão.");
      setLoading(false);
    }
  }, [fetchSavings]);

  // ── Loading State ───────────────────────────────────────

  if (loading) {
    return (
      <>
        <header className="flex items-center justify-between px-5 pt-4">
          <Logo />
          <ProgressDots currentStep={3} totalSteps={3} />
        </header>

        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
          <div>
            <p className="text-lg font-semibold text-gray-700">A calcular poupança...</p>
            <p className="mt-1 text-sm text-gray-500">A comparar preços entre lojas</p>
          </div>
        </main>

        <BottomNav currentPage="profile" />
      </>
    );
  }

  // ── Error State ─────────────────────────────────────────

  if (error || !data) {
    return (
      <>
        <header className="flex items-center justify-between px-5 pt-4">
          <Logo />
          <ProgressDots currentStep={3} totalSteps={3} />
        </header>

        <main className="flex flex-1 flex-col items-center justify-center px-5 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-10 w-10 text-red-400"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="mb-1 text-lg font-semibold text-gray-700">Algo correu mal</h2>
          <p className="text-sm text-gray-500">{error || "Não foi possível calcular a poupança."}</p>
        </main>

        <footer className="border-t border-gray-200 bg-gray-50 px-5 py-3 pb-5">
          <a href="/" className="btn-primary">
            Voltar ao scan
          </a>
        </footer>

        <BottomNav currentPage="profile" />
      </>
    );
  }

  // ── Success State ───────────────────────────────────────

  const storeLabel = fmtStoreLabel(data.storeName);
  const bestAlternative = data.alternatives.length > 0
    ? data.alternatives.reduce((best, curr) => (curr.totalPrice < best.totalPrice ? curr : best))
    : null;

  return (
    <>
      <header className="flex items-center justify-between px-5 pt-4">
        <Logo />
        <ProgressDots currentStep={3} totalSteps={3} />
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-4">
        {/* Store label */}
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">
          Talão de{" "}
          <strong className="text-gray-800">{storeLabel}</strong>
          {data.storeDate ? (
            <>
              {" "}
              &middot;{" "}
              {data.storeDate}
            </>
          ) : receipt?.storeDate ? (
            <>
              {" "}
              &middot;{" "}
              {receipt.storeDate}
            </>
          ) : null}
        </p>

        {/* Spent card */}
        <div className="mb-2.5 rounded-2xl border-2 border-gray-300 bg-white px-[18px] py-4 text-center">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Nesta compra gastaste
          </p>
          <p className="text-[32px] font-extrabold tracking-tight text-gray-900">
            {fmtEur(data.totalSpent)} €
          </p>
          <p className="mt-0.5 text-xs text-gray-400">{storeLabel}</p>
        </div>

        {/* Alternative card */}
        {bestAlternative && (
          <div className="mb-2.5 rounded-2xl border-2 border-green-300 bg-primary-light px-[18px] py-4 text-center">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">
              No {fmtStoreLabel(bestAlternative.storeName)} terias pago
            </p>
            <p className="text-[28px] font-extrabold tracking-tight text-primary">
              {fmtEur(bestAlternative.totalPrice)} €
            </p>
            <p className="mt-0.5 text-xs text-primary-accent">
              {fmtStoreLabel(bestAlternative.storeName)}
            </p>
          </div>
        )}

        {/* Savings banner */}
        {data.savings && data.savings.amount > 0 ? (
          <div className="mb-5 rounded-2xl bg-gradient-to-br from-primary to-[#43A047] px-[18px] py-[18px] text-center text-white shadow-[0_4px_16px_rgba(46,125,50,0.25)]">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider opacity-85">
              Poupança potencial
            </p>
            <p className="text-[38px] font-extrabold tracking-tight">
              {fmtEur(data.savings.amount)} €
              <span className="ml-1 text-xl">🎉</span>
            </p>
          </div>
        ) : data.savings ? (
          <div className="mb-5 rounded-2xl bg-gray-100 px-[18px] py-[18px] text-center text-gray-700">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider opacity-75">
              Poupança potencial
            </p>
            <p className="text-[28px] font-extrabold tracking-tight">
              0,00 €
            </p>
            <p className="mt-1 text-xs opacity-75">Já estás na loja mais barata!</p>
          </div>
        ) : null}

        {/* Top savers */}
        {data.topSavers.length > 0 && (
          <>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Onde poupaste mais
            </h2>
            <ul className="flex flex-col gap-2">
              {data.topSavers.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-2.5 rounded-xl border-[1.5px] border-gray-100 bg-gray-50 px-3.5 py-3"
                >
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary-light text-[11px] font-bold text-primary">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-gray-900">
                      {item.name}
                    </p>
                    <p className="mt-px text-[11px] text-gray-500">
                      {fmtEur(item.pricePaid)} € &rarr;{" "}
                      {fmtEur(item.alternativePrice)} € no {fmtStoreLabel(item.store)}
                    </p>
                  </div>
                  <span className="flex-shrink-0 text-right text-[15px] font-bold text-primary">
                    &minus;{fmtEur(item.difference)} €
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>

      <footer className="border-t border-gray-200 bg-gray-50 px-5 py-3 pb-5">
        <a href="/historico" className="btn-secondary">
          Ver histórico completo
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </a>
      </footer>

      <BottomNav currentPage="profile" />
    </>
  );
}
