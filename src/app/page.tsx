import Logo from "@/components/Logo";
import BottomNav from "@/components/BottomNav";

export default function ScanPage() {
  return (
    <>
      <header className="px-5 pt-5">
        <Logo />
        <p className="mt-0.5 text-[13px] text-gray-500">Poupa nas compras, sem esforço</p>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-5 pb-2">
        <a
          href="/confirmar"
          className="flex h-36 w-36 flex-col items-center justify-center rounded-full border-4 border-primary bg-primary-light text-primary shadow-[0_4px_16px_rgba(46,125,50,0.18)] transition-transform hover:scale-[1.04]"
          title="Tirar foto ao talão"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mb-1 h-10 w-10">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <span className="max-w-[100px] text-center text-[13px] font-semibold leading-tight">Tirar foto ao talão</span>
        </a>

        <a href="#" className="mt-[18px] border-b-[1.5px] border-dashed border-gray-400 pb-px text-sm text-gray-700 transition-colors hover:border-primary hover:text-primary">
          Ou escolhe uma foto da galeria
        </a>

        <div className="mt-8 text-center text-xs leading-relaxed text-gray-400">
          Suportamos talões do Continente, Pingo Doce e mais
          <div className="mt-1.5 flex justify-center gap-2">
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-500">Continente</span>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-500">Pingo Doce</span>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-500">+ breve</span>
          </div>
        </div>
      </main>

      <BottomNav currentPage="scan" />
    </>
  );
}
