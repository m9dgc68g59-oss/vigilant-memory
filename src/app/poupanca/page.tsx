import Logo from "@/components/Logo";
import ProgressDots from "@/components/ProgressDots";
import BottomNav from "@/components/BottomNav";

const topSavers = [
  { rank: 1, name: "Azeite Virgem Extra Gallo 75cl", prices: "5,99 € → 4,79 € no Pingo Doce", diff: "−1,20 €" },
  { rank: 2, name: "Peito de Frango (kg)", prices: "5,90 €/kg → 4,99 €/kg no Pingo Doce", diff: "−0,73 €" },
  { rank: 3, name: "Iogurte Grego Natural 4×125g", prices: "1,79 €/un → 1,43 €/un no Pingo Doce", diff: "−0,73 €" },
];

export default function PoupancaPage() {
  return (
    <>
      <header className="flex items-center justify-between px-5 pt-4">
        <Logo />
        <ProgressDots currentStep={3} totalSteps={3} />
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">
          Talão de <strong className="text-gray-800">Continente</strong> · 28/07/2026
        </p>

        <div className="mb-2.5 rounded-2xl border-2 border-gray-300 bg-white px-[18px] py-4 text-center">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">Nesta compra gastaste</p>
          <p className="text-[32px] font-extrabold tracking-tight text-gray-900">43,20 €</p>
          <p className="mt-0.5 text-xs text-gray-400">Continente</p>
        </div>

        <div className="mb-2.5 rounded-2xl border-2 border-green-300 bg-primary-light px-[18px] py-4 text-center">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">No Pingo Doce terias pago</p>
          <p className="text-[28px] font-extrabold tracking-tight text-primary">38,50 €</p>
          <p className="mt-0.5 text-xs text-primary-accent">Pingo Doce</p>
        </div>

        <div className="mb-5 rounded-2xl bg-gradient-to-br from-primary to-[#43A047] px-[18px] py-[18px] text-center text-white shadow-[0_4px_16px_rgba(46,125,50,0.25)]">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider opacity-85">Poupança potencial</p>
          <p className="text-[38px] font-extrabold tracking-tight">4,70 €<span className="ml-1 text-xl">🎉</span></p>
        </div>

        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Onde poupaste mais</h2>
        <ul className="flex flex-col gap-2">
          {topSavers.map((item) => (
            <li key={item.rank} className="flex items-center gap-2.5 rounded-xl border-[1.5px] border-gray-100 bg-gray-50 px-3.5 py-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary-light text-[11px] font-bold text-primary">{item.rank}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-gray-900">{item.name}</p>
                <p className="mt-px text-[11px] text-gray-500">{item.prices}</p>
              </div>
              <span className="flex-shrink-0 text-right text-[15px] font-bold text-primary">{item.diff}</span>
            </li>
          ))}
        </ul>
      </main>

      <footer className="border-t border-gray-200 bg-gray-50 px-5 py-3 pb-5">
        <a href="/historico" className="btn-secondary">
          Ver histórico completo
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </a>
      </footer>

      <BottomNav currentPage="profile" />
    </>
  );
}
