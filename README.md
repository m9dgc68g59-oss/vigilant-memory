# PoupaJá

App mobile-first para ajudar pessoas em Portugal a poupar nas compras de supermercado.

## Stack

- **Next.js 15** com App Router + TypeScript
- **Tailwind CSS 4** com paleta verde (#2E7D32 primary)
- **PostgreSQL** via **Drizzle ORM**
- **OCR** via GPT-4V / Claude Vision API (a implementar)

## Estrutura

```
src/
  app/
    layout.tsx          # Layout raiz (metadata PT-PT, fonte Inter)
    page.tsx            # Ecrã 1 — Scan do talão
    globals.css         # Estilos globais + Tailwind
    confirmar/
      page.tsx          # Ecrã 2 — Confirmação de itens
    poupanca/
      page.tsx          # Ecrã 3 — Resumo de poupança
    historico/
      page.tsx          # Placeholder — Histórico
    dashboard/
      page.tsx          # Placeholder — Dashboard
  components/
    BottomNav.tsx        # Barra de navegação inferior (Scan/Histórico/Perfil)
    Logo.tsx             # Logo PoupaJá
    ProgressDots.tsx     # Indicador de progresso (passo 1/2/3)
  db/
    schema.ts            # Schema Drizzle (users, receipts, receiptItems, referencePrices)
    index.ts             # Instância drizzle com pool Postgres
```

## Setup

```bash
cd /home/team/shared/poupaja-app
bun install        # ou npm install
```

## Desenvolvimento

```bash
bun dev            # next dev — http://localhost:3000
bun run build      # next build
```

## Base de Dados

1. Configurar `DATABASE_URL` no `.env` (ver `.env.example`)
2. Gerar migrations: `bun run db:generate`
3. Aplicar schema: `bun run db:push`

## Wireframes

Os wireframes de referência estão em `/home/team/shared/wireframes/`:
- `ecra1-scan.html` — página inicial
- `ecra2-confirmacao.html` — confirmação
- `ecra3-poupanca.html` — resumo de poupança

## Paleta de Cores

- Primary: `#2E7D32`
- Accent: `#4CAF50`
- Light: `#E8F5E9`
- Dark: `#1B5E20`
