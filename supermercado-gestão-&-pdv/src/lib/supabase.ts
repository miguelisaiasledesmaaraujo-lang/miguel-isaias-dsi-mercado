import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig } from '../types';

const CONFIG_STORAGE_KEY = 'mecanica_supabase_config';

export function getStoredSupabaseConfig(): SupabaseConfig {
  try {
    const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
    const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    }

    if (envUrl && envKey) {
      return { url: envUrl, anonKey: envKey };
    }
  } catch (err) {
    console.error('Erro ao obter config Supabase:', err);
  }
  return { url: '', anonKey: '' };
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (!config.url || !config.anonKey) {
    supabaseInstance = null;
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey);
    } catch (e) {
      console.error('Falha ao instanciar Supabase client:', e);
      supabaseInstance = null;
    }
  }
  return supabaseInstance;
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  if (config.url && config.anonKey) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey);
    } catch (e) {
      console.error('Erro ao inicializar client com nova config:', e);
    }
  } else {
    supabaseInstance = null;
  }
}

export function clearSupabaseConfig(): void {
  localStorage.removeItem(CONFIG_STORAGE_KEY);
  supabaseInstance = null;
}

export async function testSupabaseConnection(config?: SupabaseConfig): Promise<{ success: boolean; message: string; tablesFound?: boolean }> {
  const cfg = config || getStoredSupabaseConfig();
  if (!cfg.url || !cfg.anonKey) {
    return { success: false, message: 'URL e Chave Anon do Supabase não configuradas.' };
  }

  try {
    const tempClient = createClient(cfg.url, cfg.anonKey);
    // Tenta consultar a tabela chamados
    const { data: _data, error } = await tempClient.from('chamados').select('id').limit(1);

    if (error) {
      if (
        error.code === '42P01' || 
        error.message?.includes('relation "chamados" does not exist') || 
        error.message?.includes('does not exist') ||
        error.code === 'PGRST204'
      ) {
        return { 
          success: true, 
          message: 'Conectado ao Supabase! Porém a tabela "chamados" ainda não foi criada. Copie o script SQL abaixo e execute no SQL Editor do seu projeto Supabase.',
          tablesFound: false 
        };
      }
      return { success: false, message: `Erro ao conectar: ${error.message} (${error.code || ''})` };
    }

    return { 
      success: true, 
      message: 'Conexão com o Supabase estabelecida com sucesso! Tabela "chamados" pronta para salvar os dados.',
      tablesFound: true 
    };
  } catch (err: any) {
    return { success: false, message: `Falha na requisição: ${err.message || 'Verifique a URL e a conexão com a internet.'}` };
  }
}

export const SUPABASE_SQL_SCHEMA = `-- ========================================================
-- SCRIPT DE CRIAÇÃO DA TABELA DE CHAMADOS NO SUPABASE
-- Sistema de Abertura e Encerramento de Chamados Mecânicos
-- ========================================================
-- Execute este script no "SQL Editor" do seu painel Supabase.
-- Ele cria a tabela 'chamados', índices, ativa o Row Level Security (RLS)
-- e define permissões completas de SELECT, INSERT, UPDATE e DELETE.
-- ========================================================

CREATE TABLE IF NOT EXISTS public.chamados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) NOT NULL UNIQUE,
    titulo VARCHAR(255) NOT NULL,
    equipamento VARCHAR(255) NOT NULL,
    setor VARCHAR(100) NOT NULL DEFAULT 'Geral',
    prioridade VARCHAR(20) NOT NULL DEFAULT 'media',
    status VARCHAR(30) NOT NULL DEFAULT 'aberto',
    parada_maquina BOOLEAN DEFAULT false,
    descricao_problema TEXT NOT NULL,
    operador_nome VARCHAR(100) NOT NULL DEFAULT 'operador',
    operador_id VARCHAR(100),
    foto_url TEXT,
    
    -- Atendimento e Solução pelo Mecânico
    mecanico_nome VARCHAR(100),
    mecanico_id VARCHAR(100),
    descricao_solucao TEXT,
    pecas_utilizadas TEXT,
    tempo_gasto_minutos INTEGER DEFAULT 0,
    tipo_manutencao VARCHAR(50),
    observacoes_tecnicas TEXT,
    
    criado_em TIMESTAMPTZ DEFAULT now(),
    atualizado_em TIMESTAMPTZ DEFAULT now(),
    iniciado_em TIMESTAMPTZ,
    encerrado_em TIMESTAMPTZ
);

-- Índices para buscas rápidas e ordenação
CREATE INDEX IF NOT EXISTS idx_chamados_codigo ON public.chamados(codigo);
CREATE INDEX IF NOT EXISTS idx_chamados_status ON public.chamados(status);
CREATE INDEX IF NOT EXISTS idx_chamados_equipamento ON public.chamados(equipamento);
CREATE INDEX IF NOT EXISTS idx_chamados_criado_em ON public.chamados(criado_em DESC);

-- ========================================================
-- ATIVAÇÃO DE ROW LEVEL SECURITY (RLS) & POLÍTICAS
-- ========================================================
ALTER TABLE public.chamados ENABLE ROW LEVEL SECURITY;

-- Limpa políticas anteriores se existirem
DROP POLICY IF EXISTS "chamados_select_policy" ON public.chamados;
DROP POLICY IF EXISTS "chamados_insert_policy" ON public.chamados;
DROP POLICY IF EXISTS "chamados_update_policy" ON public.chamados;
DROP POLICY IF EXISTS "chamados_delete_policy" ON public.chamados;

-- Políticas públicas para leitura e gravação pelo sistema
CREATE POLICY "chamados_select_policy" ON public.chamados 
    FOR SELECT USING (true);

CREATE POLICY "chamados_insert_policy" ON public.chamados 
    FOR INSERT WITH CHECK (true);

CREATE POLICY "chamados_update_policy" ON public.chamados 
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "chamados_delete_policy" ON public.chamados 
    FOR DELETE USING (true);

-- Notificação em tempo real (Realtime) para chamados novos e atualizados
ALTER PUBLICATION supabase_realtime ADD TABLE public.chamados;
`;
