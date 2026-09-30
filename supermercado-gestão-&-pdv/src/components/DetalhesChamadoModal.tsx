import React from 'react';
import { Chamado, User } from '../types';
import { 
  X, 
  Printer, 
  Wrench, 
  Clock, 
  CheckCircle2, 
  AlertOctagon, 
  HardHat, 
  ShieldCheck, 
  Calendar, 
  Layers, 
  FileText
} from 'lucide-react';
import { 
  formatDateTime, 
  getStatusInfo, 
  getPriorityInfo, 
  getTipoManutencaoLabel 
} from '../utils/formatters';

interface DetalhesChamadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  chamado: Chamado | null;
  currentUser: User;
  onOpenEncerrar?: (chamado: Chamado) => void;
  onIniciarAtendimento?: (chamado: Chamado) => void;
}

export const DetalhesChamadoModal: React.FC<DetalhesChamadoModalProps> = ({
  isOpen,
  onClose,
  chamado,
  currentUser,
  onOpenEncerrar,
  onIniciarAtendimento,
}) => {
  if (!isOpen || !chamado) return null;

  const statusInfo = getStatusInfo(chamado.status);
  const priorityInfo = getPriorityInfo(chamado.prioridade);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 print:max-w-none print:shadow-none print:border-none print:p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-800 text-slate-200 rounded-xl border border-slate-700">
              <Wrench className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white">Ordem de Serviço / Chamado</h2>
                <span className="font-mono text-sm px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-bold border border-slate-700">
                  {chamado.codigo}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Criado em {formatDateTime(chamado.criado_em)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              title="Imprimir Ordem de Serviço"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center space-x-1.5 text-xs font-semibold"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir OS</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable/View Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-200">
          {/* Top Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold mb-1">
                Status Atual
              </span>
              <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusInfo.badgeClass}`}>
                <span className={`w-2 h-2 rounded-full ${statusInfo.dotClass}`} />
                <span>{statusInfo.label}</span>
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold mb-1">
                Prioridade
              </span>
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${priorityInfo.badgeClass}`}>
                {priorityInfo.label}
              </span>
            </div>

            {chamado.parada_maquina && (
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                <span>MÁQUINA PARADA</span>
              </div>
            )}
          </div>

          {/* Machine & Sector Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
              <span className="text-xs text-slate-400 block font-semibold mb-1">
                Máquina / Equipamento
              </span>
              <span className="text-base font-bold text-white">
                {chamado.equipamento}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
              <span className="text-xs text-slate-400 block font-semibold mb-1">
                Setor / Área da Fábrica
              </span>
              <span className="text-base font-bold text-white">
                {chamado.setor}
              </span>
            </div>
          </div>

          {/* Seção 1: Registro do Operador */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <HardHat className="w-4 h-4" />
              <span>Abertura pelo Operador</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800/80">
                <span>
                  Operador responsável: <strong className="text-slate-200">{chamado.operador_nome}</strong>
                </span>
                <span>
                  Aberto em: <strong className="text-slate-200">{formatDateTime(chamado.criado_em)}</strong>
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1.5">{chamado.titulo}</h4>
                <p className="text-xs leading-relaxed text-slate-300 whitespace-pre-wrap bg-slate-900/80 p-3 rounded-lg border border-slate-800/80">
                  {chamado.descricao_problema}
                </p>
              </div>

              {chamado.foto_url && (
                <div>
                  <span className="text-xs font-semibold text-slate-400 block mb-1.5">
                    Foto do Defeito Anexada:
                  </span>
                  <div className="rounded-xl overflow-hidden border border-slate-800 max-h-64 bg-slate-950 flex items-center justify-center">
                    <img
                      src={chamado.foto_url}
                      alt="Anexo do defeito"
                      className="object-contain max-h-64 w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Seção 2: Intervenção e Encerramento do Mecânico */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-sky-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Intervenção & Solução do Mecânico</span>
            </div>

            {chamado.status === 'encerrado' ? (
              <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-slate-400 pb-2 border-b border-slate-800/80">
                  <span>
                    Mecânico executor: <strong className="text-sky-300">{chamado.mecanico_nome || 'Mecânico'}</strong>
                  </span>
                  <span>
                    Encerrado em: <strong className="text-emerald-400">{formatDateTime(chamado.encerrado_em)}</strong>
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                    Descrição do que foi feito:
                  </span>
                  <p className="text-xs leading-relaxed text-slate-200 whitespace-pre-wrap bg-slate-900/90 p-3 rounded-lg border border-emerald-500/20">
                    {chamado.descricao_solucao}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      Tipo de Manutenção
                    </span>
                    <span className="text-xs font-semibold text-slate-200">
                      {getTipoManutencaoLabel(chamado.tipo_manutencao)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      Tempo Gasto
                    </span>
                    <span className="text-xs font-semibold text-slate-200 flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-sky-400" />
                      {chamado.tempo_gasto_minutos ? `${chamado.tempo_gasto_minutos} min (${(chamado.tempo_gasto_minutos / 60).toFixed(1)}h)` : 'Não informado'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 sm:col-span-1">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      Peças Substituídas
                    </span>
                    <span className="text-xs font-semibold text-slate-200 truncate block">
                      {chamado.pecas_utilizadas || 'Nenhuma peça trocada'}
                    </span>
                  </div>
                </div>

                {chamado.observacoes_tecnicas && (
                  <div className="pt-2 border-t border-slate-800 text-xs">
                    <span className="text-slate-400 font-semibold">Orientações Técnicas para Operação:</span>
                    <p className="text-slate-300 mt-1 italic">
                      "{chamado.observacoes_tecnicas}"
                    </p>
                  </div>
                )}
              </div>
            ) : chamado.status === 'em_atendimento' ? (
              <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-sky-300 uppercase">Em Atendimento Técnico</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Assumido por: <strong className="text-white">{chamado.mecanico_nome || 'Mecânico'}</strong>
                  </p>
                </div>
                {currentUser.role === 'mecanico' && onOpenEncerrar && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenEncerrar(chamado);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow transition"
                  >
                    Encerrar Agora
                  </button>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center py-6">
                <p className="text-xs text-slate-400">
                  Chamado aberto aguardando triagem e atendimento da equipe de manutenção.
                </p>
                {currentUser.role === 'mecanico' && onIniciarAtendimento && (
                  <button
                    onClick={() => {
                      onIniciarAtendimento(chamado);
                      onClose();
                    }}
                    className="mt-3 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition"
                  >
                    Iniciar Atendimento
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            Fechar
          </button>

          {currentUser.role === 'mecanico' && chamado.status !== 'encerrado' && (
            <div className="flex space-x-2">
              {chamado.status === 'aberto' && onIniciarAtendimento && (
                <button
                  onClick={() => {
                    onIniciarAtendimento(chamado);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition"
                >
                  Assumir Chamado
                </button>
              )}
              {onOpenEncerrar && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenEncerrar(chamado);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Encerrar Chamado</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
