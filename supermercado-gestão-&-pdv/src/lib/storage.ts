import { Chamado } from '../types';
import { getSupabaseClient } from './supabase';

const CHAMADOS_STORAGE_KEY = 'mecanica_chamados_v1';

// Chamados de exemplo iniciais para demonstração imediata do fluxo
const SEED_CHAMADOS: Chamado[] = [
  {
    id: 'seed-chm-01',
    codigo: 'CHM-2026-0001',
    titulo: 'Vazamento de fluido hidráulico no pistão de corte',
    equipamento: 'Prensa Hidráulica 60T (PH-03)',
    setor: 'Estamparia & Corte',
    prioridade: 'urgente',
    status: 'em_atendimento',
    parada_maquina: true,
    descricao_problema: 'A máquina começou a perder pressão durante o ciclo de prensagem e observou-se vazamento contínuo de óleo ISO 68 próximo às vedações do cilindro principal. Risco de derramamento no piso.',
    operador_nome: 'operador',
    operador_id: 'usr-operador-1',
    criado_em: new Date(Date.now() - 3600000 * 3).toISOString(), // 3h atrás
    atualizado_em: new Date(Date.now() - 3600000 * 1).toISOString(),
    iniciado_em: new Date(Date.now() - 3600000 * 1).toISOString(),
    mecanico_nome: 'mecanico',
    mecanico_id: 'usr-mecanico-1',
  },
  {
    id: 'seed-chm-02',
    codigo: 'CHM-2026-0002',
    titulo: 'Ruído estridente e vibração excessiva no fuso principal',
    equipamento: 'Torno CNC Romi Centur 30D',
    setor: 'Usinagem de Precisão',
    prioridade: 'alta',
    status: 'aberto',
    parada_maquina: false,
    descricao_problema: 'Ao ultrapassar 1800 RPM a placa apresenta vibração anormal e ruído agudo na caixa de engrenagens superior. Peça saindo com marcas de trepidação no acabamento.',
    operador_nome: 'operador',
    operador_id: 'usr-operador-1',
    criado_em: new Date(Date.now() - 3600000 * 5).toISOString(),
    atualizado_em: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'seed-chm-03',
    codigo: 'CHM-2026-0003',
    titulo: 'Superaquecimento do motor elétrico de acionamento',
    equipamento: 'Compressor de Parafuso 40HP',
    setor: 'Utilidades / Ar Comprimido',
    prioridade: 'alta',
    status: 'encerrado',
    parada_maquina: true,
    descricao_problema: 'O compressor desarmou pelo relé térmico duas vezes seguidas no turno da manhã. Temperatura do mancal ultrapassando 92°C.',
    operador_nome: 'operador',
    operador_id: 'usr-operador-1',
    mecanico_nome: 'mecanico',
    mecanico_id: 'usr-mecanico-1',
    descricao_solucao: 'Realizada desmontagem do acoplamento elástico. Identificado entupimento severo nas aletas do radiador de arrefecimento e filtro de ar saturado. Feita limpeza química das colmeias com desengraxante, substituição do elemento filtrante e lubrificação com graxa de alta temperatura Kluber nos rolamentos. Testado em carga plena por 45 minutos com temperatura estabilizada em 74°C.',
    pecas_utilizadas: '1x Filtro de ar de admissão mod. CP-40, 200g Graxa Kluber alta temperatura, 1x Kit anéis o-ring',
    tempo_gasto_minutos: 90,
    tipo_manutencao: 'mecanica',
    observacoes_tecnicas: 'Recomenda-se antecipar a troca de óleo do cárter para o próximo ciclo de 500h e manter as grelhas da sala de compressores desobstruídas.',
    criado_em: new Date(Date.now() - 3600000 * 24).toISOString(),
    iniciado_em: new Date(Date.now() - 3600000 * 22).toISOString(),
    encerrado_em: new Date(Date.now() - 3600000 * 20).toISOString(),
    atualizado_em: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
];

export function getLocalChamados(): Chamado[] {
  try {
    const raw = localStorage.getItem(CHAMADOS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Erro ao ler chamados locais:', e);
  }
  // Se não houver nada, inicializa com os chamados de exemplo
  saveLocalChamados(SEED_CHAMADOS);
  return SEED_CHAMADOS;
}

export function saveLocalChamados(chamados: Chamado[]): void {
  try {
    localStorage.setItem(CHAMADOS_STORAGE_KEY, JSON.stringify(chamados));
  } catch (e) {
    console.error('Erro ao salvar chamados locais:', e);
  }
}

export async function fetchChamados(): Promise<Chamado[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('chamados')
        .select('*')
        .order('criado_em', { ascending: false });

      if (!error && data) {
        const mapped: Chamado[] = data.map((row: any) => ({
          id: row.id,
          codigo: row.codigo,
          titulo: row.titulo,
          equipamento: row.equipamento,
          setor: row.setor || 'Geral',
          prioridade: row.prioridade || 'media',
          status: row.status || 'aberto',
          parada_maquina: Boolean(row.parada_maquina),
          descricao_problema: row.descricao_problema,
          operador_nome: row.operador_nome,
          operador_id: row.operador_id || undefined,
          foto_url: row.foto_url || undefined,
          mecanico_nome: row.mecanico_nome || undefined,
          mecanico_id: row.mecanico_id || undefined,
          descricao_solucao: row.descricao_solucao || undefined,
          pecas_utilizadas: row.pecas_utilizadas || undefined,
          tempo_gasto_minutos: row.tempo_gasto_minutos ? Number(row.tempo_gasto_minutos) : undefined,
          tipo_manutencao: row.tipo_manutencao || undefined,
          observacoes_tecnicas: row.observacoes_tecnicas || undefined,
          criado_em: row.criado_em || new Date().toISOString(),
          atualizado_em: row.atualizado_em || new Date().toISOString(),
          iniciado_em: row.iniciado_em || undefined,
          encerrado_em: row.encerrado_em || undefined,
        }));

        saveLocalChamados(mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Falha ao buscar chamados no Supabase, usando local:', err);
    }
  }
  return getLocalChamados();
}

export async function persistChamado(chamado: Chamado): Promise<Chamado> {
  // Salva no armazenamento local primeiro
  const localList = getLocalChamados();
  const index = localList.findIndex((c) => c.id === chamado.id);
  let updatedList: Chamado[];

  if (index >= 0) {
    updatedList = [...localList];
    updatedList[index] = chamado;
  } else {
    updatedList = [chamado, ...localList];
  }
  saveLocalChamados(updatedList);

  // Se Supabase estiver conectado, persiste na nuvem
  const client = getSupabaseClient();
  if (client) {
    try {
      const payload: Record<string, any> = {
        id: chamado.id,
        codigo: chamado.codigo,
        titulo: chamado.titulo,
        equipamento: chamado.equipamento,
        setor: chamado.setor,
        prioridade: chamado.prioridade,
        status: chamado.status,
        parada_maquina: chamado.parada_maquina,
        descricao_problema: chamado.descricao_problema,
        operador_nome: chamado.operador_nome,
        operador_id: chamado.operador_id || null,
        foto_url: chamado.foto_url || null,
        mecanico_nome: chamado.mecanico_nome || null,
        mecanico_id: chamado.mecanico_id || null,
        descricao_solucao: chamado.descricao_solucao || null,
        pecas_utilizadas: chamado.pecas_utilizadas || null,
        tempo_gasto_minutos: chamado.tempo_gasto_minutos || null,
        tipo_manutencao: chamado.tipo_manutencao || null,
        observacoes_tecnicas: chamado.observacoes_tecnicas || null,
        criado_em: chamado.criado_em,
        atualizado_em: new Date().toISOString(),
        iniciado_em: chamado.iniciado_em || null,
        encerrado_em: chamado.encerrado_em || null,
      };

      const { error } = await client.from('chamados').upsert(payload);
      if (error) {
        console.warn('Erro ao persistir chamado no Supabase:', error.message);
      }
    } catch (err) {
      console.warn('Erro de rede ao salvar chamado no Supabase:', err);
    }
  }

  return chamado;
}

export async function deleteChamado(id: string): Promise<void> {
  const localList = getLocalChamados().filter((c) => c.id !== id);
  saveLocalChamados(localList);

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('chamados').delete().eq('id', id);
    } catch (err) {
      console.warn('Erro ao deletar chamado no Supabase:', err);
    }
  }
}

export async function syncLocalChamadosToSupabase(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase não conectado. Configure a URL e chave Anon.' };
  }

  try {
    const list = getLocalChamados();
    if (list.length === 0) {
      return { success: true, message: 'Nenhum chamado pendente para sincronizar.' };
    }

    const payload = list.map((c) => ({
      id: c.id,
      codigo: c.codigo,
      titulo: c.titulo,
      equipamento: c.equipamento,
      setor: c.setor,
      prioridade: c.prioridade,
      status: c.status,
      parada_maquina: c.parada_maquina,
      descricao_problema: c.descricao_problema,
      operador_nome: c.operador_nome,
      operador_id: c.operador_id || null,
      foto_url: c.foto_url || null,
      mecanico_nome: c.mecanico_nome || null,
      mecanico_id: c.mecanico_id || null,
      descricao_solucao: c.descricao_solucao || null,
      pecas_utilizadas: c.pecas_utilizadas || null,
      tempo_gasto_minutos: c.tempo_gasto_minutos || null,
      tipo_manutencao: c.tipo_manutencao || null,
      observacoes_tecnicas: c.observacoes_tecnicas || null,
      criado_em: c.criado_em,
      atualizado_em: c.atualizado_em,
      iniciado_em: c.iniciado_em || null,
      encerrado_em: c.encerrado_em || null,
    }));

    const { error } = await client.from('chamados').upsert(payload);
    if (error) {
      throw new Error(`Erro ao enviar dados ao Supabase: ${error.message}`);
    }

    return {
      success: true,
      message: `Sincronização concluída! ${list.length} chamados sincronizados com o Supabase.`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Erro durante a sincronização com o banco de dados.',
    };
  }
}
