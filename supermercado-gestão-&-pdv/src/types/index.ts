export type UserRole = 'operador' | 'mecanico';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  cargo: string;
  avatarColor: string;
}

export type ChamadoPrioridade = 'baixa' | 'media' | 'alta' | 'urgente';

export type ChamadoStatus = 'aberto' | 'em_atendimento' | 'encerrado' | 'cancelado';

export type TipoManutencao = 
  | 'mecanica' 
  | 'eletrica' 
  | 'hidraulica' 
  | 'pneumatica' 
  | 'preventiva' 
  | 'ajuste_geral'
  | 'lubrificacao'
  | 'outro';

export interface Chamado {
  id: string;
  codigo: string;
  titulo: string;
  equipamento: string;
  setor: string;
  prioridade: ChamadoPrioridade;
  status: ChamadoStatus;
  parada_maquina: boolean;
  descricao_problema: string;
  operador_nome: string;
  operador_id?: string;
  foto_url?: string;

  // Informações preenchidas pelo mecânico
  mecanico_nome?: string;
  mecanico_id?: string;
  descricao_solucao?: string;
  pecas_utilizadas?: string;
  tempo_gasto_minutos?: number;
  tipo_manutencao?: TipoManutencao | string;
  observacoes_tecnicas?: string;

  criado_em: string;
  atualizado_em: string;
  iniciado_em?: string;
  encerrado_em?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export interface ChamadoStats {
  total: number;
  abertos: number;
  emAtendimento: number;
  encerrados: number;
  maquinasParadas: number;
  tempoMedioReparoMinutos: number;
}
