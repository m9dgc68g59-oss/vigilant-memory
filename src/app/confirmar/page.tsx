import Logo from "@/components/Logo";
import ProgressDots from "@/components/ProgressDots";
import BottomNav from "@/components/BottomNav";

const mockItems = [
  { name: "Leite Meio Gordo Mimosa 1L", qty: "2 un", price: "1,98 €" },
  { name: "Pão de Forma Integral", qty: "1 un", price: "1,49 €" },
  { name: "Banana da Madeira", qty: "1,2 kg", price: "1,80 €" },
  { name: "Arroz Agulha Bom Sucesso", qty: "1 un", price: "1,29 €" },
  { name: "Azeite Virgem Extra Gallo 75cl", qty: "1 un", price: "5,99 €" },
  { name: "Ovos M/L Continente 6 un", qty: "1 un", price: "1,65 €" },
  { name: "Peito de Frango (kg)", qty: "0,8 kg", price: "4,72 €" },
  { name: "Iogurte Grego Natural 4×125g", qty: "2 un", price: "3,58 €" },
];

export default function ConfirmarPage() {
  return (
    <>
      <header className="flex items-center justify-between px-5 pt-4">
        <Logo />
        <ProgressDots currentStep={2} totalSteps={3} />
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-4">
        <div className="mb-[18px] flex gap-2.5">
          <div className="flex-[2]">
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">Loja</label>
            <input type="text" defaultValue="Continente" placeholder="Nome da loja" className="field-input" />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">Data</label>
            <input type="text" defaultValue="28/07/2026" placeholder="DD/MM/AAAA" className="field-input" />
          </div>
        </div>

        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Itens do talão</h2>

        <ul className="flex flex-col gap-2">
          {mockItems.map((item, i) => (
            <li key={i} className="flex items-center gap-2 rounded-xl border-[1.5px] border-gray-200 bg-gray-50 px-3 py-2.5 transition-colors hover:border-gray-300">
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">{item.name}</span>
              <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">{item.qty}</span>
              <span className="min-w-[56px] text-right">
                <input type="text" defaultValue={item.price} className="w-[62px] rounded-md border-[1.5px] border-transparent bg-transparent py-1 text-right text-sm font-bold text-gray-900 transition-colors focus:border-primary focus:bg-white focus:outline-none" />
              </span>
              <button className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500" title="Remover">&times;</button>
            </li>
          ))}
        </ul>

        <button className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-300 py-3 text-[13px] font-medium text-gray-600 transition-colors hover:border-primary hover:text-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Adicionar item
        </button>
      </main>

      <footer className="border-t border-gray-200 bg-gray-50 px-5 py-3 pb-5">
        <a href="/poupanca" className="btn-primary">
          Confirmar e ver poupança
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </a>
      </footer>

      <BottomNav currentPage="historico" />
    </>
  );
}
