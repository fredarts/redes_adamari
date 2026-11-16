-- ==============================================================================
-- REDES ADAMARI (ATELIÊ ADAMARI - TABULEIRO DO NORTE / CE)
-- Esquema Completo do Banco de Dados no Supabase (PostgreSQL)
-- Inclui: Controle de Estoque (80 variações), Clientes/CRM, Pedidos, Itens e Posts IA
-- ==============================================================================

-- 1. TABELA DE CONTROLE DE ESTOQUE (INVENTORY)
-- 2 Redes (rede-tradicional, rede-mosquiteiro) x 4 Tamanhos (M, G, GG, XGG) x 10 Cores = 80 SKUs
-- + 3 Acessórios de Instalação (gancho-armador, mola-extensora, corda-nylon) = 83 SKUs
CREATE TABLE IF NOT EXISTS public.inventory (
  sku TEXT PRIMARY KEY,
  product_id TEXT NOT NULL CHECK (product_id IN ('rede-tradicional', 'rede-mosquiteiro', 'gancho-armador', 'mola-extensora', 'corda-nylon')),
  size TEXT NOT NULL CHECK (size IN ('M', 'G', 'GG', 'XGG', 'UNICO')),
  color_id TEXT NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 10 CHECK (stock_quantity >= 0),
  low_stock_threshold INTEGER NOT NULL DEFAULT 3 CHECK (low_stock_threshold >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Caso a tabela já exista com a constraint antiga, atualiza as constraints:
ALTER TABLE public.inventory DROP CONSTRAINT IF EXISTS inventory_product_id_check;
ALTER TABLE public.inventory ADD CONSTRAINT inventory_product_id_check
  CHECK (product_id IN ('rede-tradicional', 'rede-mosquiteiro', 'gancho-armador', 'mola-extensora', 'corda-nylon'));

ALTER TABLE public.inventory DROP CONSTRAINT IF EXISTS inventory_size_check;
ALTER TABLE public.inventory ADD CONSTRAINT inventory_size_check
  CHECK (size IN ('M', 'G', 'GG', 'XGG', 'UNICO'));

CREATE INDEX IF NOT EXISTS idx_inventory_product_size_color
  ON public.inventory (product_id, size, color_id);

-- 2. TABELA DE CLIENTES & CRM 360° (CUSTOMERS)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  cpf TEXT,
  city TEXT,
  uf TEXT,
  cep TEXT,
  address JSONB DEFAULT '{}'::jsonb,
  notes TEXT DEFAULT '',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  total_spent NUMERIC(10, 2) NOT NULL DEFAULT 0,
  orders_count INTEGER NOT NULL DEFAULT 0,
  accepts_marketing BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers (phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers (email);
CREATE INDEX IF NOT EXISTS idx_customers_uf ON public.customers (uf);

-- 3. TABELA DE PEDIDOS E ENTREGAS (ORDERS)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_reference TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  customer_cpf TEXT,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('pix', 'card')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'approved', 'cancelled')),
  fulfillment_status TEXT NOT NULL DEFAULT 'aguardando_pagamento' CHECK (
    fulfillment_status IN ('aguardando_pagamento', 'separando', 'enviado', 'entregue', 'cancelado')
  ),
  tracking_code TEXT,
  subtotal NUMERIC(10, 2) NOT NULL,
  shipping_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL,
  shipping_address JSONB NOT NULL,
  city TEXT NOT NULL,
  uf TEXT NOT NULL,
  mp_preference_id TEXT,
  mp_payment_id TEXT,
  stock_deducted BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_reference ON public.orders (order_reference);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders (payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_status ON public.orders (fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_orders_uf ON public.orders (uf);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);

-- 4. TABELA DE ITENS VENDIDOS EM CADA PEDIDO (ORDER_ITEMS)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_reference TEXT NOT NULL,
  sku TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  size TEXT NOT NULL,
  color_id TEXT NOT NULL,
  color_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items (product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_size ON public.order_items (size);
CREATE INDEX IF NOT EXISTS idx_order_items_color_id ON public.order_items (color_id);

-- 5. TABELA DO ESTÚDIO DE REDES SOCIAIS (GEMINI NANO BANANA)
CREATE TABLE IF NOT EXISTS public.social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt TEXT NOT NULL,
  caption TEXT NOT NULL,
  aspect_ratio TEXT NOT NULL DEFAULT '1:1',
  product_id TEXT NOT NULL,
  color_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON public.social_posts (created_at DESC);

-- 6. SEGURANÇA ROW LEVEL SECURITY (RLS) - BOAS PRÁTICAS SUPABASE
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

-- Leitura pública apenas para a tabela de estoque (para o site exibir disponibilidade)
DROP POLICY IF EXISTS "Leitura publica de estoque" ON public.inventory;
CREATE POLICY "Leitura publica de estoque"
  ON public.inventory
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- As demais operações de escrita e leitura de pedidos/clientes são feitas exclusivamente
-- pelas rotas de servidor Next.js autenticadas usando a SUPABASE_SERVICE_ROLE_KEY.

-- 7. CARGA INICIAL (SEED) DAS 80 VARIAÇÕES DE ESTOQUE (2 MODELOS x 4 TAMANHOS x 10 CORES)
INSERT INTO public.inventory (sku, product_id, size, color_id, stock_quantity, low_stock_threshold)
SELECT
  p.product_id || '-' || s.size || '-' || c.color_id AS sku,
  p.product_id,
  s.size,
  c.color_id,
  CASE
    WHEN s.size = 'GG' THEN 15
    WHEN s.size = 'G' THEN 12
    ELSE 8
  END AS stock_quantity,
  3 AS low_stock_threshold
FROM
  (VALUES ('rede-tradicional'), ('rede-mosquiteiro')) AS p(product_id)
CROSS JOIN
  (VALUES ('M'), ('G'), ('GG'), ('XGG')) AS s(size)
CROSS JOIN
  (VALUES
    ('azul-royal'),
    ('azul-turquesa'),
    ('rosa-pink'),
    ('vermelho-vivo'),
    ('amarelo-sol'),
    ('verde-militar'),
    ('verde-bandeira'),
    ('laranja-tropical'),
    ('azul-marinho'),
    ('roxo-acai')
  ) AS c(color_id)
ON CONFLICT (sku) DO NOTHING;

-- 7. SEED DOS 3 ACESSÓRIOS DE INSTALAÇÃO (GANCHO ARMADOR, MOLA EXTENSORA E CORDA NYLON)
INSERT INTO public.inventory (sku, product_id, size, color_id, stock_quantity, low_stock_threshold)
VALUES
  ('gancho-armador-UNICO-padrao', 'gancho-armador', 'UNICO', 'padrao', 25, 4),
  ('mola-extensora-UNICO-padrao', 'mola-extensora', 'UNICO', 'padrao', 25, 4),
  ('corda-nylon-UNICO-padrao', 'corda-nylon', 'UNICO', 'padrao', 30, 4)
ON CONFLICT (sku) DO NOTHING;
