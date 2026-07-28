"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";
import ProgressDots from "@/components/ProgressDots";
import BottomNav from "@/components/BottomNav";
import type { ReceiptData, ReceiptItem } from "@/types/receipt";

// ---------------------------------------------------------------------------
// Inner component that reads searchParams (must be wrapped in Suspense)
// ---------------------------------------------------------------------------
function ConfirmarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [editingItemIdx, setEditingItemIdx] = useState<number | null>(null);

  // Parse receipt data from URL search params
  useEffect(() => {
    const raw = searchParams.get("data");
    if (!raw) {
      // No data — show empty state (user navigated directly)
      return;
    }

    try {
      const parsed = JSON.parse(raw) as ReceiptData;
      // Basic validation
      if (parsed.storeName && Array.isArray(parsed.items)) {
        setReceipt(parsed);
      }
    } catch {
      console.error("Failed to parse receipt data from URL");
    }
  }, [searchParams]);

  // ── Handlers ──────────────────────────────────────────────────────────

  function updateStoreName(value: string) {
    if (!receipt) return;
    setReceipt({ ...receipt, storeName: value });
  }

  function updateStoreDate(value: string) {
    if (!receipt) return;
    setReceipt({ ...receipt, storeDate: value });
  }

  function updateItem(idx: number, field: keyof ReceiptItem, value: string | number) {
    if (!receipt) return;
    const items = receipt.items.map((item, i) => (i === idx ? { ...item, [field]: value } : item));
    setReceipt({ ...receipt, items });
  }

  function removeItem(idx: number) {
    if (!receipt) return;
    const items = receipt.items.filter((_, i) => i !== idx);
    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
    setReceipt({ ...receipt, items, totalAmount: Math.round(totalAmount * 100) / 100 });
  }

  function addItem() {
    if (!receipt) return;
    const newItem: ReceiptItem = {
      name: "Novo item",
      quantity: "1 un",
      unitPrice: 0,
      totalPrice: 0,
    };
    setReceipt({ ...receipt, items: [...receipt.items, newItem] });
    setEditingItemIdx(receipt.items.length);
  }

  function handleConfirm() {
    if (!receipt) return;

    // Recalculate total
    const totalAmount = receipt.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const finalReceipt = { ...receipt, totalAmount: Math.round(totalAmount * 100) / 100 };

    // Store in localStorage for the poupanca page to consume
    localStorage.setItem("poupaja-current-receipt", JSON.stringify(finalReceipt));

    router.push("/poupanca");
  }

  // ── Empty state (no data) ────────────────────────────────────────────

  if (!receipt) {
    return (
      <>
        <header className="flex items-center justify-between px-5 pt-4">
          <Logo />
          <ProgressDots currentStep={2} totalSteps={3} />
        </header>

        <main className="flex flex-1 flex-col items-center justify-center px-5 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-10 w-10 text-gray-400"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="mb-1 text-lg font-semibold text-gray-700">Nenhum talão para confirmar</h2>
          <p className="text-sm text-gray-500">
            Digitaliza um talão na página inicial para continuares.
          </p>
        </main>

        <footer className="border-t border-gray-200 bg-gray-50 px-5 py-3 pb-5">
          <button
            onClick={() => router.push("/")}
            className="btn-primary"
          >
            Voltar ao scan
          </button>
        </footer>

        <BottomNav currentPage="historico" />
      </>
    );
  }

  // ── Main confirm view ────────────────────────────────────────────────

  return (
    <>
      <header className="flex items-center justify-between px-5 pt-4">
        <Logo />
        <ProgressDots currentStep={2} totalSteps={3} />
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-4">
        {/* Store & date */}
        <div className="mb-[18px] flex gap-2.5">
          <div className="flex-[2]">
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Loja
            </label>
            <input
              type="text"
              value={receipt.storeName}
              onChange={(e) => updateStoreName(e.target.value)}
              placeholder="Nome da loja"
              className="field-input"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Data
            </label>
            <input
              type="text"
              value={receipt.storeDate}
              onChange={(e) => updateStoreDate(e.target.value)}
              placeholder="DD/MM/AAAA"
              className="field-input"
            />
          </div>
        </div>

        {/* Items */}
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Itens do talão
        </h2>

        <ul className="flex flex-col gap-2">
          {receipt.items.map((item, idx) => (
            <li
              key={idx}
              className={`flex items-center gap-2 rounded-xl border-[1.5px] bg-gray-50 px-3 py-2.5 transition-colors ${
                editingItemIdx === idx ? "border-primary ring-1 ring-primary/20" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {/* Name */}
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(idx, "name", e.target.value)}
                onFocus={() => setEditingItemIdx(idx)}
                onBlur={() => setEditingItemIdx(null)}
                className="min-w-0 flex-1 truncate bg-transparent text-sm font-medium text-gray-900 outline-none"
                placeholder="Nome do produto"
              />

              {/* Quantity */}
              <input
                type="text"
                value={item.quantity}
                onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                onFocus={() => setEditingItemIdx(idx)}
                onBlur={() => setEditingItemIdx(null)}
                className="w-[64px] rounded-md bg-gray-100 px-2 py-0.5 text-center text-xs font-medium text-gray-500 outline-none"
                placeholder="1 un"
              />

              {/* Price */}
              <span className="min-w-[72px] text-right">
                <input
                  type="number"
                  step="0.01"
                  value={item.totalPrice}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    updateItem(idx, "totalPrice", isNaN(v) ? 0 : Math.round(v * 100) / 100);
                  }}
                  onFocus={() => setEditingItemIdx(idx)}
                  onBlur={() => setEditingItemIdx(null)}
                  className="w-[72px] rounded-md border-[1.5px] border-transparent bg-transparent py-1 text-right text-sm font-bold text-gray-900 outline-none transition-colors focus:border-primary focus:bg-white"
                />
              </span>

              {/* Remove */}
              <button
                onClick={() => removeItem(idx)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                title="Remover"
              >
                &times;
              </button>
            </li>
          ))}
        </ul>

        {/* Add item */}
        <button
          onClick={addItem}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-300 py-3 text-[13px] font-medium text-gray-600 transition-colors hover:border-primary hover:text-primary"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Adicionar item
        </button>
      </main>

      {/* Footer with total and confirm button */}
      <footer className="border-t border-gray-200 bg-gray-50 px-5 py-3 pb-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Total</span>
          <span className="text-lg font-extrabold text-gray-900">
            {receipt.totalAmount.toFixed(2).replace(".", ",")} €
          </span>
        </div>
        <button onClick={handleConfirm} className="btn-primary">
          Confirmar e ver poupança
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </footer>

      <BottomNav currentPage="historico" />
    </>
  );
}

// ---------------------------------------------------------------------------
// Page export — wraps inner component in Suspense (required for useSearchParams)
// ---------------------------------------------------------------------------
export default function ConfirmarPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <ConfirmarContent />
    </Suspense>
  );
}
