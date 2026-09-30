import React from 'react';
import { Chamado, User } from '../types';
import { 
  getStatusInfo, 
  getPriorityInfo, 
  formatTimeAgo, 
  getTipoManutencaoLabel 
} from '../utils/formatters';
import { 
  Wrench, 
  AlertOctagon, 
  Clock, 
  CheckCircle2, 
  Eye, 
  Play, 
  Building2, 
  User as UserIcon,
  ShieldCheck,
  ChevronRight,
  HardHat
} from 'lucide-react';

interface ChamadoCardProps {
  chamado: Chamado;
  currentUser: User;
  onViewDetails: (chamado: Chamado) => void;
  onIniciarAtendimento: (chamado: Chamado) => void;
  onOpenEncerrar: (chamado: Chamado) => void;
  onDelete?: (chamadoId: string) => void;
}

export const ChamadoCard: React.FC<ChamadoCardProps> = ({
  chamado,
  currentUser,
  onViewDetails,
  onIniciarAtendimento,
  onOpenEncerrar,
}) => {
  const statusInfo = getStatusInfo(chamado.status);
  const priorityInfo = getPriorityInfo(chamado.prioridade);

  return (
    <div
      className={`group relative rounded-2xl bg-slate-900 border transition-all duration-200 overflow-hidden flex flex-col justify-between hover:shadow-xl hover:shadow-black/40 ${
        chamado.parada_maquina && chamado.status !== 'encerrado'
          ? 'border-rose-500/60 shadow-lg shadow-rose-950/20'
          : chamado.status === 'aberto'
          ? 'border-amber-500/40 hover:border-amber-500/70'
          : chamado.status === 'em_atendimento'
          ? 'border-sky-500/40 hover:border-sky-500/70'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Top Warning Banner if Machine is Stopped */}
      {chamado.parada_maquina && chamado.status !== 'encerrado' && (
        <div className="bg-rose-500/20 border-b border-rose-500/30 px-4 py-1.5 flex items-center justify-between text-xs text-rose-300 font-bold tracking-wide">
          <span className="flex items-center space-x-1.5">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>MÁQUINA PARADA - PRIORIDADE DE PRODUÇÃO</span>
          </span>
          <span className="text-[10px] uppercase font-mono bg-rose-500/30 px-1.5 py-0.5 rounded">
            Interrupção
          </span>
        </div>
      )}

      {/* Main Card Content */}
      <div className="p-5 flex-1 space-y-3.5">
        {/* Header: Code & Badges */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-950 text-amber-400 border border-slate-800">
              {chamado.codigo}
            </span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${priorityInfo.badgeClass}`}>
              {priorityInfo.label}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusInfo.badgeClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
              <span>{statusInfo.label}</span>
            </span>
          </div>
        </div>

        {/* Equipment & Sector */}
        <div>
          <div className="flex items-center text-xs text-slate-400 space-x-1.5 mb-1">
            <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="font-semibold text-slate-300 truncate">{chamado.equipamento}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 truncate">{chamado.setor}</span>
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2">
            {chamado.titulo}
          </h3>
        </div>

        {/* Problem Description Snippet */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center font-semibold text-slate-300">
              <HardHat className="w-3 h-3 mr-1 text-amber-400" />
              Operador ({chamado.operador_nome}):
            </span>
            <span className="text-[10px]">{formatTimeAgo(chamado.criado_em)}</span>
          </div>
          <p className="line-clamp-2 leading-relaxed italic text-slate-300">
            "{chamado.descricao_problema}"
          </p>
        </div>

        {/* Mechanic Section (if in progress or completed) */}
        {chamado.status === 'encerrado' && (
          <div className="bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-xl text-xs space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold">
              <span className="flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Solução do Mecânico ({chamado.mecanico_nome || 'Mecânico'}):
              </span>
              {chamado.tempo_gasto_minutos ? (
                <span className="text-[10px] text-slate-400 flex items-center font-normal">
                  <Clock className="w-3 h-3 mr-0.5" />
                  {chamado.tempo_gasto_minutos} min
                </span>
              ) : null}
            </div>
            <p className="text-slate-200 line-clamp-2 text-[11px] leading-relaxed">
              {chamado.descricao_solucao}
            </p>
            {chamado.pecas_utilizadas && (
              <div className="text-[10px] text-slate-400 truncate pt-1 border-t border-slate-800/60">
                <strong className="text-slate-300">Peças:</strong> {chamado.pecas_utilizadas}
              </div>
            )}
          </div>
        )}

        {chamado.status === 'em_atendimento' && (
          <div className="bg-sky-950/20 border border-sky-500/20 p-2.5 rounded-xl text-xs flex items-center justify-between text-sky-300">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              <span>Em manutenção por: <strong>{chamado.mecanico_nome || 'Mecânico'}</strong></span>
            </span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-5 py-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-2">
        <button
          onClick={() => onViewDetails(chamado)}
          className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 transition font-medium"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Ver Detalhes</span>
        </button>

        <div className="flex items-center space-x-2">
          {/* Actions for Mecânico role */}
          {currentUser.role === 'mecanico' && chamado.status === 'aberto' && (
            <button
              onClick={() => onIniciarAtendimento(chamado)}
              className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 active:scale-95 text-slate-950 font-bold text-xs shadow transition flex items-center space-x-1"
            >
              <Play className="w-3 h-3" />
              <span>Atender</span>
            </button>
          )}

          {currentUser.role === 'mecanico' && (chamado.status === 'aberto' || chamado.status === 'em_atendimento') && (
            <button
              onClick={() => onOpenEncerrar(chamado)}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center space-x-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Encerrar</span>
            </button>
          )}

          {/* Action if Operador */}
          {currentUser.role === 'operador' && (
            <button
              onClick={() => onViewDetails(chamado)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center space-x-1"
            >
              <span>Acompanhar</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
