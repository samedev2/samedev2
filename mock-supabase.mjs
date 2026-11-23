/**
 * Mock local do Supabase para desenvolvimento sem banco.
 *
 * ══════════════════════════════════════════════════════════════════════════
 *  POR QUE ISTO EXISTE
 * ══════════════════════════════════════════════════════════════════════════
 *  O Supabase self-hosted (ou cloud) pode não estar no ar enquanto o front
 *  está sendo ajustado. Este script responde na porta 54321 (a mesma do
 *  Supabase local oficial) com dados de exemplo, para o site renderizar
 *  completo: vitrine de notebooks, serviços, textos e mensagens.
 *
 *  NÃO é um substituto do banco de verdade: nada é persistido, tudo vive
 *  na memória e some quando o processo é encerrado. Ele existe para o
 *  feedback visual durante o desenvolvimento.
 *
 *  Uso:
 *    npm run mock          # sobe o mock
 *    npm run dev           # em outro terminal, sobe o Vite
 *
 *  Aponte o .env.local para:
 *    VITE_SUPABASE_URL=http://localhost:54321
 *    VITE_SUPABASE_ANON_KEY=mock-anon-key
 *    VITE_ADMIN_EMAIL=admin@exemplo.com
 *
 *  O login do painel admin aceita qualquer senha para o e-mail configurado.
 * ══════════════════════════════════════════════════════════════════════════
 */

import http from 'node:http';

const PORT = Number(process.env.MOCK_PORT || 54321);
const ADMIN_EMAIL = process.env.MOCK_ADMIN_EMAIL || 'admin@exemplo.com';

const now = new Date().toISOString();
const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();

// ──────────────────────────────────────────────────────────────────────────
// Dados de exemplo
// ──────────────────────────────────────────────────────────────────────────

const siteContent = [
  { key: 'hero_title', value: 'SEU PC COMO NOVO.', updated_at: now },
  {
    key: 'hero_description',
    value:
      'Manutenção preventiva, corretiva e upgrades de alta performance. Especialistas em notebooks e desktops gamer e office em Fortaleza.',
    updated_at: now,
  },
  { key: 'whatsapp_number', value: '5585999910250', updated_at: now },
  { key: 'site_title', value: 'FORTAL TECH', updated_at: now },
  { key: 'visits', value: '1245', updated_at: now },
  {
    key: 'footer_text',
    value: '© 2024 Fortal Tech - Assistencia e Sistemas. Todos os direitos reservados.',
    updated_at: now,
  },
];

const services = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    title: 'Manutenção de Desktop',
    description: 'Preventiva, corretiva e aditiva para manter seu PC voando.',
    icon_name: 'Monitor',
    tags: ['Limpeza', 'Hardware', 'Montagem'],
    order_index: 1,
    created_at: now,
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    title: 'Notebooks',
    description: 'Reparos especializados, troca de telas, teclados e baterias.',
    icon_name: 'Laptop',
    tags: ['Reparo', 'Telas', 'Baterias'],
    order_index: 2,
    created_at: now,
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    title: 'Formatação & Sistema',
    description: 'Instalação limpa, backup de dados e reparo de erros do Windows.',
    icon_name: 'Settings',
    tags: ['Windows', 'Backup', 'Drivers'],
    order_index: 3,
    created_at: now,
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    title: 'Otimização SSD/NVMe',
    description: 'Deixe seu sistema 10x mais rápido com otimização de unidade C.',
    icon_name: 'Zap',
    tags: ['Velocidade', 'NVMe', 'Performance'],
    order_index: 4,
    created_at: now,
  },
  {
    id: '55555555-5555-4555-8555-555555555555',
    title: 'Troca de Pasta Térmica',
    description: 'Redução de temperatura e aumento da vida útil do processador.',
    icon_name: 'Cpu',
    tags: ['Cooling', 'Performance', 'Limpeza'],
    order_index: 5,
    created_at: now,
  },
  {
    id: '66666666-6666-4666-8666-666666666666',
    title: 'Upgrades',
    description: 'Aumento de memória RAM e troca de HD por SSD de alta performance.',
    icon_name: 'HardDrive',
    tags: ['RAM', 'SSD', 'Upgrade'],
    order_index: 6,
    created_at: now,
  },
];

const notebooks = [
  {
    id: 'a1111111-1111-4111-8111-111111111111',
    model: 'Dell XPS 15 9520',
    specs: 'i7-12700H · 32GB RAM · RTX 3050 Ti · SSD 1TB NVMe',
    price: 6499.0,
    image_url: 'http://localhost:54321/mock-img/xps.svg',
    gallery_urls: [],
    is_promotional: true,
    is_sold: false,
    sold_at: null,
    created_at: daysAgo(2),
  },
  {
    id: 'a2222222-2222-4222-8222-222222222222',
    model: 'Acer Nitro V15',
    specs: 'i5-13500H · 16GB RAM · RTX 4050 · SSD 512GB',
    price: 4299.9,
    image_url: 'http://localhost:54321/mock-img/nitro.svg',
    gallery_urls: [],
    is_promotional: false,
    is_sold: false,
    sold_at: null,
    created_at: daysAgo(5),
  },
  {
    id: 'a3333333-3333-4333-8333-333333333333',
    model: 'Notebook Gamer Lenovo LOQ',
    specs: 'Ryzen 7 7840HS · 16GB RAM · RTX 4050 · SSD 1TB',
    price: 5299.0,
    image_url: 'http://localhost:54321/mock-img/loq.svg',
    gallery_urls: [],
    is_promotional: true,
    is_sold: false,
    sold_at: null,
    created_at: daysAgo(8),
  },
  {
    id: 'a4444444-4444-4444-8444-444444444444',
    model: 'MacBook Air M2 13”',
    specs: 'Apple M2 · 8GB unificada · SSD 256GB',
    price: 4799.0,
    image_url: 'http://localhost:54321/mock-img/macbook.svg',
    gallery_urls: [],
    is_promotional: false,
    is_sold: true,
    sold_at: daysAgo(1),
    created_at: daysAgo(14),
  },
];

const contacts = [
  {
    id: 'c1111111-1111-4111-8111-111111111111',
    name: 'Carlos Mendes',
    whatsapp: '5585998877665',
    service_type: 'Troca de Pasta Térmica',
    message: 'Meu notebook esquenta muito e desliga sozinho depois de 20 minutos de jogo.',
    status: 'pending',
    created_at: daysAgo(1),
  },
  {
    id: 'c2222222-2222-4222-8222-222222222222',
    name: 'Juliana Prado',
    whatsapp: '5585997766554',
    service_type: 'Formatação & Sistema',
    message: 'Preciso formatar meu desktop e fazer backup das fotos antes. Qual o prazo?',
    status: 'read',
    created_at: daysAgo(3),
  },
  {
    id: 'c3333333-3333-4333-8333-333333333333',
    name: 'Rafael Nogueira',
    whatsapp: '5585996655443',
    service_type: 'Upgrades',
    message: 'Quero trocar meu HD por SSD e aumentar a memória para 32GB. Quanto fica?',
    status: 'pending',
    created_at: daysAgo(6),
  },
];

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Expose-Headers': '*',
  'Access-Control-Max-Age': '86400',
};

function send(res, status, body, headers = {}) {
  const payload = body === undefined ? '' : JSON.stringify(body);
  res.writeHead(status, {
    ...CORS,
    'Content-Type': 'application/json; charset=utf-8',
    ...headers,
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
  });
}

/** JWT falso, apenas com as claims que o supabase-js lê. */
function fakeJwt(email) {
  const b64 = (obj) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');
  const header = b64({ alg: 'HS256', typ: 'JWT' });
  const payload = b64({
    sub: 'mock-user-id',
    email,
    role: 'authenticated',
    aud: 'authenticated',
    exp: Math.floor(Date.now() / 1000) + 3600,
  });
  return `${header}.${payload}.mock-signature`;
}

function authUser(email) {
  return {
    id: 'mock-user-id',
    aud: 'authenticated',
    role: 'authenticated',
    email,
    email_confirmed_at: now,
    phone: '',
    confirmed_at: now,
    last_sign_in_at: now,
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: {},
    identities: [],
    created_at: now,
    updated_at: now,
  };
}

const IMG_PALETTE = {
  xps: ['#1f2937', '#0ea5e9', 'Dell XPS 15'],
  nitro: ['#111827', '#22c55e', 'Acer Nitro V15'],
  loq: ['#0b1120', '#f97316', 'Lenovo LOQ'],
  macbook: ['#18181b', '#a1a1aa', 'MacBook Air M2'],
};

function mockSvg(name) {
  const [c1, c2, label] = IMG_PALETTE[name] ?? ['#111827', '#334155', 'Notebook'];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}" stop-opacity="0.65"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#g)"/>
  <g fill="none" stroke="${c2}" stroke-width="7" opacity="0.9">
    <rect x="250" y="170" width="300" height="190" rx="12"/>
    <path d="M210 380h380l-26 34H236z"/>
  </g>
  <rect x="268" y="188" width="264" height="154" rx="6" fill="#0f172a" opacity="0.75"/>
  <text x="400" y="470" font-family="Segoe UI, Arial, sans-serif" font-size="30" font-weight="700"
        fill="#f8fafc" text-anchor="middle" opacity="0.95">${label}</text>
  <text x="400" y="510" font-family="Segoe UI, Arial, sans-serif" font-size="19"
        fill="#cbd5e1" text-anchor="middle" opacity="0.8">Fortal Tech — imagem de exemplo</text>
</svg>`;
}

// ──────────────────────────────────────────────────────────────────────────
// Servidor
// ──────────────────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const path = url.pathname;
  const method = req.method?.toUpperCase() ?? 'GET';

  if (method === 'OPTIONS') {
    res.writeHead(204, CORS);
    return res.end();
  }

  // Imagens de exemplo servidas pelo próprio mock
  if (path.startsWith('/mock-img/')) {
    const name = path.replace('/mock-img/', '').replace(/\.svg$/, '');
    res.writeHead(200, { ...CORS, 'Content-Type': 'image/svg+xml; charset=utf-8' });
    return res.end(mockSvg(name));
  }

  // ── Auth ────────────────────────────────────────────────────────────────
  if (path.startsWith('/auth/v1/')) {
    if (path === '/auth/v1/token' && method === 'POST') {
      const body = await readBody(req);
      const email = String(body.email || '').trim();
      if (!email) {
        return send(res, 400, {
          error: 'invalid_request',
          error_description: 'Missing email or phone',
        });
      }
      const token = fakeJwt(email);
      return send(res, 200, {
        access_token: token,
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: `mock-refresh-${Date.now()}`,
        user: authUser(email),
      });
    }

    if (path === '/auth/v1/user' && method === 'GET') {
      const auth = req.headers.authorization || '';
      const email = auth.includes('mock-user-id')
        ? ADMIN_EMAIL
        : decodeJwtEmail(auth) || ADMIN_EMAIL;
      return send(res, 200, authUser(email));
    }

    if (path === '/auth/v1/logout' && method === 'POST') {
      res.writeHead(204, CORS);
      return res.end();
    }

    if (path === '/auth/v1/settings') {
      return send(res, 200, {
        disable_signup: false,
        mailer_autoconfirm: true,
        external: { email: true, phone: false },
      });
    }

    return send(res, 404, { message: 'rota de auth não implementada no mock' });
  }

  // ── Storage ─────────────────────────────────────────────────────────────
  if (path.startsWith('/storage/v1/')) {
    if (path.includes('/object/')) {
      const key = path.split('/object/')[1] || '';
      if (method === 'POST' || method === 'PUT') {
        await readBody(req);
        return send(res, 200, { Key: key, id: 'mock-object-id' });
      }
      if (method === 'DELETE') {
        res.writeHead(200, CORS);
        return res.end();
      }
    }
    return send(res, 200, []);
  }

  // ── PostgREST ───────────────────────────────────────────────────────────
  if (path.startsWith('/rest/v1/rpc/')) {
    const fn = path.replace('/rest/v1/rpc/', '');
    if (fn === 'increment_visits') {
      const row = siteContent.find((c) => c.key === 'visits');
      const next = String((Number(row?.value) || 0) + 1);
      if (row) row.value = next;
      return send(res, 200, Number(next));
    }
    return send(res, 404, { message: `rpc "${fn}" não implementada no mock` });
  }

  if (path.startsWith('/rest/v1/')) {
    const table = path.replace('/rest/v1/', '').split('/')[0];
    const tables = { notebooks, services, site_content: siteContent, contacts };

    if (!tables[table]) {
      return send(res, 404, { message: `tabela "${table}" não existe no mock` });
    }
    const rows = tables[table];

    if (method === 'GET') {
      const order = url.searchParams.get('order');
      let out = [...rows];
      if (order) {
        const [column, direction] = order.split('.');
        out.sort((a, b) => {
          const av = a[column];
          const bv = b[column];
          if (av === bv) return 0;
          const cmp = av > bv ? 1 : -1;
          return direction === 'desc' ? -cmp : cmp;
        });
      }
      return send(res, 200, out);
    }

    if (method === 'POST') {
      const body = await readBody(req);
      const list = Array.isArray(body) ? body : [body];
      const created = list.map((item, i) => ({
        id: item.id || `mock-${Date.now()}-${i}`,
        created_at: now,
        ...item,
      }));
      rows.unshift(...created);
      return send(res, 201, created);
    }

    if (method === 'PATCH' || method === 'PUT') {
      const body = await readBody(req);
      const filterId = url.searchParams.get('id');
      const updated = [];
      for (const row of rows) {
        if (!filterId || row.id === filterId) {
          Object.assign(row, body);
          updated.push(row);
        }
      }
      return send(res, 200, updated);
    }

    if (method === 'DELETE') {
      const filterId = url.searchParams.get('id');
      const kept = rows.filter((row) => row.id !== filterId);
      const removed = rows.length - kept.length;
      rows.length = 0;
      rows.push(...kept);
      return send(res, 200, removed);
    }
  }

  return send(res, 404, { message: `mock sem rota para ${method} ${path}` });
});

function decodeJwtEmail(auth) {
  try {
    const token = String(auth).replace(/^Bearer\s+/i, '');
    const [, payload] = token.split('.');
    if (!payload) return null;
    const json = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return json.email ?? null;
  } catch {
    return null;
  }
}

server.listen(PORT, () => {
  console.log(`[mock] Supabase local em http://localhost:${PORT}`);
  console.log(`[mock] admin: ${ADMIN_EMAIL} (qualquer senha)`);
  console.log('[mock] Ctrl+C para encerrar');
});
