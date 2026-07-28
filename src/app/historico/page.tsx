import Logo from "@/components/Logo";
import BottomNav from "@/components/BottomNav";

export default function HistoricoPage() {
  return (
    <>
      <header className="px-5 pt-5">
        <Logo />
        <p className="mt-0.5 text-[13px] text-gray-500">Histórico de compras</p>
      </header>
      <main className="flex flex-1 items-center justify-center px-5">
        <div className="text-center">
          <p className="text-4xl">📋</p>
          <p className="mt-3 text-sm font-medium text-gray-600">Histórico em breve</p>
          <p className="mt-1 text-xs text-gray-400">As tuas compras anteriores vão aparecer aqui.</p>
        </div>
      </main>
      <BottomNav currentPage="historico" />
    </>
  );
}
