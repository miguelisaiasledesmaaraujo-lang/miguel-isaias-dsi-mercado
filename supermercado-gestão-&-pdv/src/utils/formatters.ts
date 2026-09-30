import { ChamadoPrioridade, ChamadoStatus, TipoManutencao } from '../types';

export function formatDateTime(isoString?: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function formatDate(isoString?: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export function formatTimeAgo(isoString?: string): string {
  if (!isoString) return '-';
  try {
    const now = new Date().getTime();
    const past = new Date(isoString).getTime();
    const diffMin = Math.floor((now - past) / (1000 * 60));

    if (diffMin < 1) return 'Agora mesmo';
    if (diffMin < 60) return `Há ${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `Há ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Há ${diffDays}d`;
  } catch {
    return isoString;
  }
}

export function getStatusInfo(status: ChamadoStatus): {
  label: string;
  badgeClass: string;
  dotClass: string;
} {
  switch (status) {
    case 'aberto':
      return {
        label: 'Aberto',
        badgeClass: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
        dotClass: 'bg-amber-400 animate-pulse',
      };
    case 'em_atendimento':
      return {
        label: 'Em Atendimento',
        badgeClass: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
        dotClass: 'bg-sky-400 animate-pulse',
      };
    case 'encerrado':
      return {
        label: 'Encerrado',
        badgeClass: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
        dotClass: 'bg-emerald-400',
      };
    case 'cancelado':
      return {
        label: 'Cancelado',
        badgeClass: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
        dotClass: 'bg-slate-400',
      };
    default:
      return {
        label: status,
        badgeClass: 'bg-slate-700 text-slate-300',
        dotClass: 'bg-slate-400',
      };
  }
}

export function getPriorityInfo(prioridade: ChamadoPrioridade): {
  label: string;
  badgeClass: string;
} {
  switch (prioridade) {
    case 'urgente':
      return {
        label: 'Urgente',
        badgeClass: 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold',
      };
    case 'alta':
      return {
        label: 'Alta',
        badgeClass: 'bg-orange-500/20 text-orange-300 border border-orange-500/40',
      };
    case 'media':
      return {
        label: 'Média',
        badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      };
    case 'baixa':
      return {
        label: 'Baixa',
        badgeClass: 'bg-slate-500/20 text-slate-300 border border-slate-500/30',
      };
    default:
      return {
        label: prioridade,
        badgeClass: 'bg-slate-700 text-slate-300',
      };
  }
}

export function getTipoManutencaoLabel(tipo?: TipoManutencao | string): string {
  switch (tipo) {
    case 'mecanica':
      return 'Mecânica';
    case 'eletrica':
      return 'Elétrica';
    case 'hidraulica':
      return 'Hidráulica';
    case 'pneumatica':
      return 'Pneumática';
    case 'preventiva':
      return 'Preventiva';
    case 'ajuste_geral':
      return 'Ajuste Geral';
    case 'lubrificacao':
      return 'Lubrificação';
    case 'outro':
      return 'Outro';
    default:
      return tipo || 'Geral';
  }
}

export function generateNextChamadoCode(existingCodes: string[]): string {
  const currentYear = new Date().getFullYear();
  let maxSeq = 0;

  for (const c of existingCodes) {
    const match = c.match(/CHM-\d{4}-(\d+)/i) || c.match(/CHM-(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  }

  const nextSeq = maxSeq + 1;
  return `CHM-${currentYear}-${String(nextSeq).padStart(4, '0')}`;
}
