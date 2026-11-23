# Fortal Tech — Assistência e Sistemas

[![CI](https://github.com/samedev2/fortaltech/actions/workflows/ci.yml/badge.svg)](https://github.com/samedev2/fortaltech/actions/workflows/ci.yml)

Site institucional + painel administrativo para assistência técnica de
notebooks e desktops em Fortaleza/CE.

React 19 · Vite 6 · Tailwind CSS 4 · Supabase self-hosted · animações em CSS puro

---

## Como rodar

**Pré-requisitos:** Node.js 18+

```bash
npm install
cp .env.example .env.local   # preencha as variáveis
npm run dev                  # http://localhost:3000
```

| Script            | O que faz                                          |
| ----------------- | -------------------------------------------------- |
| `npm run dev`     | Servidor de desenvolvimento (porta 3000, host 0.0.0.0) |
| `npm run build`   | Build de produção em `dist/`                       |
| `npm run preview` | Serve o build de produção localmente               |
| `npm run lint`    | Checagem de tipos (`tsc --noEmit`)                 |

## Variáveis de ambiente

| Variável                 | Descrição                                                       |
| ------------------------ | --------------------------------------------------------------- |
| `VITE_SUPABASE_URL`      | URL base da instância self-hosted (a mesma do Studio)             |
| `VITE_SUPABASE_ANON_KEY` | Chave pública anon da sua instância                              |
| `VITE_ADMIN_EMAIL`       | E-mail autorizado a acessar o painel. Vazio = painel desabilitado |

Não há fallback embutido no código: se as variáveis faltarem, o app mostra
uma **tela de configuração pendente** com o `.env` esperado, em vez de um
erro genérico de conexão.

### Desenvolvimento sem banco (mock local)

Enquanto o Supabase não está no ar, o projeto sobe com um **mock local** que
responde na porta `54321` (a mesma do Supabase local oficial) com dados de
exemplo — vitrine, serviços, textos e mensagens.

```bash
npm run mock    # terminal 1 — sobe o mock na porta 54321
npm run dev     # terminal 2 — sobe o Vite na porta 3000
```

O `.env.local` precisa apontar para ele:

```
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=mock-anon-key
VITE_ADMIN_EMAIL=admin@exemplo.com
```

No login do painel admin, **qualquer senha** funciona para o e-mail
configurado. Os dados vivem na memória: nada é persistido, e o mock morre com
o processo. Serve para ajustar a interface sem depender do banco — não
substitui o `schema.sql` nem o Supabase de verdade.

## Banco de dados

O app usa **Supabase self-hosted** (compatível com a stack oficial
docker-compose). O cliente `supabase-js` é o mesmo das instâncias cloud —
mudar de host não exige mudança de código.

Execute [`schema.sql`](./schema.sql) no SQL Editor da sua instância. O
script é **idempotente**: pode rodar quantas vezes quiser sem duplicar
conteúdo nem serviços.

> **Antes de executar:** troque o e-mail do admin em **um único lugar** — o
> bloco `DO $$` no fim do `schema.sql`. Todas as políticas de RLS usam
> essa variável. O mesmo e-mail precisa estar em `VITE_ADMIN_EMAIL`.

### Checklist da instância self-hosted

| Passo | Onde |
| ----- | ---- |
| **CORS** | `API_CORS_ALLOWED_ORIGINS` no `.env` do docker-compose da instância. Sem isso o navegador bloqueia toda requisição. |
| **Site URL / Redirect URLs** | Studio → Authentication → URL Configuration |
| **Usuário admin** | Studio → Authentication → Users → Add user (mesmo e-mail do `VITE_ADMIN_EMAIL`) |
| **Bucket `notebooks`** | Studio → Storage → New bucket, Public = ON (o SQL Editor pode não ter permissão para criar bucket no self-hosted) |
| **Schema** | SQL Editor → colar e executar `schema.sql` |

### Por que existe a função `increment_visits()`

A tabela `site_content` é **somente leitura** para o público — a RLS só libera
`SELECT`. Um `UPDATE` anônimo do contador de visitas seria sempre negado, e o
número de visitas ficaria congelado.

O `schema.sql` cria a função `public.increment_visits()` com `SECURITY DEFINER`
e a libera para `anon`. É o **único** caminho de escrita público, e ela só toca
a chave `visits`. Se você já tem o banco no ar, rode apenas o bloco da função:

```sql
CREATE OR REPLACE FUNCTION public.increment_visits()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  novo bigint;
BEGIN
  UPDATE site_content
  SET value = CASE
      WHEN value ~ '^[0-9]+$' THEN (value::bigint + 1)::text
      ELSE '1'
    END
  WHERE key = 'visits'
  RETURNING value::bigint INTO novo;
  RETURN novo;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_visits() TO anon, authenticated;
```



## Estrutura

```
src/
├── App.tsx                  # Orquestração: dados, auth e roteamento de views
├── index.css                # Design system (tokens, componentes, utilidades)
├── lib/
│   ├── types.ts             # Tipos de domínio (espelham o schema do Supabase)
│   ├── utils.ts             # Formatação (BRL, telefone, data) e validação
│   ├── icons.tsx            # Registro de ícones por serviço + BrandMark
│   └── supabase.ts          # Cliente Supabase
└── components/
    ├── ui/                  # Primitivas: Modal, Button, Field, Toast, Badge,
    │                        #   Skeleton, ConfirmDialog, SectionHeading
    ├── site/                # Site público (Navbar, Hero, Serviços, eGPU,
    │                        #   Notebooks, Velocidade, Contato, Rodapé)
    └── admin/               # Painel admin (abas + modais de CRUD)
```

Arquivos na raiz que também importam:

| Arquivo | Para quê |
| ------- | -------- |
| `Dockerfile` | Build em duas etapas (Node → nginx) para o Coolify |
| `nginx.conf` | SPA fallback, cache de assets com hash, gzip |
| `.dockerignore` | Mantém `node_modules` e `.env` fora da imagem |
| `schema.sql` | Estrutura do banco + RLS + seeds idempotentes |
| `.env.example` | Checklist das variáveis que o build exige |

### Onde ficam as regras de UI

- **Tokens e classes** — `src/index.css`. As classes `btn-*`, `field`,
  `surface`, `container-page`, `section-pad`, `eyebrow` e `display` são o
  vocabulário visual do projeto. Prefira elas a utilitários avulsos.
- **Paleta** — `brand` (esmeralda) é a cor de marca; `accent` (azul) marca
  o tema de hardware/eGPU; `ink-950…600` são as superfícies escuras.
- **Acessibilidade** — foco visível global via `:focus-visible`, modais com
  focus trap e `role="dialog"`, campos com `<label>` real, e respeito a
  `prefers-reduced-motion`.
- **Animações de entrada** — só mexem em `transform`, **nunca em `opacity` a
  partir de 0**. O relógio de animação do compositor pode congelar quando a
  aba vai para segundo plano; com `opacity` animada o conteúdo ficaria
  permanentemente invisível. Com `transform` apenas, ele degrada para
  "visível e levemente deslocado". A entrada é controlada por `Reveal`
  (IntersectionObserver) + as classes `reveal-pending` / `reveal-in`.

### Fluxo de dados

`App.tsx` é a **camada de dados**: executa as escritas no Supabase e lança
(`throw`) em caso de erro. A camada de UI que originou a ação é responsável
pelo feedback (`toast`), garantindo **uma única mensagem por ação** —
nunca duas.

## Painel administrativo

Acesse pelo link **"Área do técnico"** no rodapé (ou pelo ícone de login).
Requer autenticação via Supabase Auth e o e-mail precisa bater com
`VITE_ADMIN_EMAIL`.

Abas disponíveis: **Notebooks**, **Serviços**, **Conteúdo** e **Mensagens**.
Notebooks vendidos são arquivados automaticamente após 2 dias.

## Deploy

O app é uma **SPA de página única** (sem react-router, âncoras `#`), então o
resultado do build é um site estático puro — `dist/` pode ser servido por
qualquer servidor de arquivos.

### ⚠️ Variáveis `VITE_*` são resolvidas em TEMPO DE BUILD

O Vite **substitui** `import.meta.env.VITE_*` por valores literais durante o
`vite build`. Se as variáveis não existirem no momento do build, o bundle sai
com o placeholder e o site nasce na tela de "configuração pendente" — sem
erro visível, só quebrado.

Cadastre estas três no Coolify **antes** do primeiro deploy:

| Variável | Valor |
| -------- | ----- |
| `VITE_SUPABASE_URL` | URL base da instância self-hosted |
| `VITE_SUPABASE_ANON_KEY` | Chave pública anon |
| `VITE_ADMIN_EMAIL` | E-mail do técnico (libera o painel admin) |

### Opção A — Docker (recomendado)

O repositório já traz `Dockerfile`, `nginx.conf` e `.dockerignore`. O build é
em duas etapas (Node → nginx) e o Coolify detecta o Dockerfile sozinho.

| Campo no Coolify | Valor |
| ----------------- | ----- |
| Build Pack | **Dockerfile** |
| Dockerfile Path | `/Dockerfile` (padrão) |
| Port | `80` |
| Healthcheck Path | `/` |

As variáveis `VITE_*` entram como **Build Variables** (o `ARG` do Dockerfile as
converte em `ENV` antes do `npm run build`).

### Opção B — Preset estático do Coolify (sem Docker)

| Campo no Coolify | Valor |
| ----------------- | ----- |
| Build Pack | **Static Site** (Nixpacks) |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Port | `3000` |

### Opção C — Node + `vite preview` (apenas para teste)

Não use em produção: `vite preview` não é um servidor de produção e não deve
ficar exposto na internet.

### CI no repositório

Todo push roda `.github/workflows/ci.yml`, com dois jobs:

| Job | O que faz |
| --- | --------- |
| **Typecheck e build** | `npm ci` → `tsc --noEmit` → `vite build`, e confere que as variáveis `VITE_*` realmente chegaram no bundle |
| **Imagem Docker** | Constrói a imagem (sem publicar), valida o `nginx.conf` com `nginx -t` e faz um smoke test servindo o `index.html` e o bundle JS |

Ou seja: um `Dockerfile` quebrado ou um erro de tipo **são detectados no
GitHub**, antes de gastar um ciclo de deploy no Coolify.
