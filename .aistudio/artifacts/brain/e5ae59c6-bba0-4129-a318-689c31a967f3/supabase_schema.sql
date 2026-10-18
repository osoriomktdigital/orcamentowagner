-- 1. Tabela de Catálogo de Itens
CREATE TABLE IF NOT EXISTS catalog (
    id BIGINT PRIMARY KEY,
    codigo_ref TEXT NOT NULL,
    categoria TEXT NOT NULL CHECK (categoria IN ('ESPAÇOS', 'ALIMENTAÇÃO', 'BEBIDAS', 'EQUIPE')),
    subcategoria TEXT,
    nome_item TEXT NOT NULL,
    qtd_base INTEGER DEFAULT 1,
    preco_unitario NUMERIC(10, 2) NOT NULL,
    flag_obs TEXT,
    descricao_detalhada TEXT
);

-- 2. Tabela de Orçamentos (Budgets)
CREATE TABLE IF NOT EXISTS budgets (
    id TEXT PRIMARY KEY,
    "clienteNome" TEXT NOT NULL,
    "clienteWhats" TEXT NOT NULL,
    "clienteEmail" TEXT,
    "dataEvento" DATE,
    "numConvidados" INTEGER,
    "totalFinal" NUMERIC(10, 2),
    subtotal NUMERIC(10, 2),
    status TEXT CHECK (status IN ('ENVIADO', 'CONTRATADO')),
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "selectedItems" JSONB,
    "activeDiscounts" JSONB,
    "paymentMethod" TEXT,
    installments INTEGER,
    itens JSONB,
    "tipoEvento" TEXT,
    "horarioEvento" TEXT,
    "duracaoEvento" TEXT,
    "contractorData" JSONB
);

-- Dica: Desabilite o RLS ou crie políticas de acesso no painel do Supabase para que o app consiga ler/escrever.
