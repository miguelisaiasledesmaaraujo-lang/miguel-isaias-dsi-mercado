import React, { useState } from 'react';
import { Chamado, TipoManutencao, User } from '../types';
import { 
  X, 
  CheckCircle2, 
  Wrench, 
  Clock, 
  Layers, 
  FileCheck, 
  AlertTriangle,
  FileText,
  User as UserIcon,
  ShieldCheck
} from 'lucide-react';
import { formatDateTime, getPriorityInfo } from '../utils/formatters';

interface EncerrarChamadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  chamado: Chamado | null;
  onEncerrar: (chamadoId: string, dados: {
    mecanico_nome: string;
    mecanico_id: string;
    descricao_solucao: string;
    pecas_utilizadas?: string;
    tempo_gasto_minutos?: number;
    tipo_manutencao?: TipoManutencao | string;
    observacoes_tecnicas?: string;
  }) => Promise<void>;
  currentUser: User;
}

export const EncerrarChamadoModal: React.FC<EncerrarChamadoModalProps> = ({
  isOpen,
  onClose,
  chamado,
  onEncerrar,
  currentUser,
}) => {
  const [descricaoSolucao, setDescricaoSolucao] = useState('');
  const [pecasUtilizadas, setPecasUtilizadas] = useState('');
  const [tempoGastoMinutos, setTempoGastoMinutos] = useState<number>(45);
  const [tipoManutencao, setTipoManutencao] = useState<TipoManutencao>('mecanica');
  const [observacoesTecnicas, setObservacoesTecnicas] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !chamado) return null;

  const priorityInfo = getPriorityInfo(chamado.prioridade);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!descricaoSolucao.trim() || descricaoSolucao.trim().length < 10) {
      setError('Por favor, descreva detalhadamente o que foi feito para solucionar o chamado (mínimo 10 caracteres).');
      return;
    }

    setSaving(true);
    try {
      await onEncerrar(chamado.id, {
        mecanico_nome: currentUser.username,
        mecanico_id: currentUser.id,
        descricao_solucao: descricaoSolucao.trim(),
        pecas_utilizadas: pecasUtilizadas.trim() || undefined,
        tempo_gasto_minutos: Number(tempoGastoMinutos) || 0,
        tipo_manutencao: tipoManutencao,
        observacoes_tecnicas: observacoesTecnicas.trim() || undefined,
      });

      onClose();
      setDescricaoSolucao('');
      setPecasUtilizadas('');
      setObservacoesTecnicas('');
    } catch (err: any) {
      setError(err.message || 'Erro ao encerrar o chamado.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Encerrar Chamado: <span className="font-mono text-amber-400">{chamado.codigo}</span>
              </h2>
              <p className="text-xs text-slate-400">
                Mecânico Responsável: <span className="text-sky-400 font-semibold">{currentUser.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center space-x-2 text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Resumo do Chamado Aberto pelo Operador */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="font-bold text-white text-sm">{chamado.titulo}</span>
              <span className={`px-2 py-0.5 rounded text-[11px] ${priorityInfo.badgeClass}`}>
                Prioridade: {priorityInfo.label}
              </span>
            </div>

            <div className="text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
              <span>
                <strong className="text-slate-300">Equipamento:</strong> {chamado.equipamento}
              </span>
              <span>
                <strong className="text-slate-300">Setor:</strong> {chamado.setor}
              </span>
              <span>
                <strong className="text-slate-300">Operador:</strong> {chamado.operador_nome}
              </span>
              <span>
                <strong className="text-slate-300">Aberto em:</strong> {formatDateTime(chamado.criado_em)}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800 text-xs text-slate-300">
              <span className="text-slate-400 font-semibold">Problema relatado pelo operador:</span>
              <p className="mt-1 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 italic text-slate-300">
                "{chamado.descricao_problema}"
              </p>
            </div>
          </div>

          {/* Requisito Principal: Descrever o que foi feito */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5 flex items-center justify-between">
              <span className="flex items-center">
                <FileCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Descrição do que foi feito pelo mecânico *
              </span>
              <span className="text-[10px] text-amber-400 font-normal">Obrigatório</span>
            </label>
            <textarea
              required
              rows={4}
              value={descricaoSolucao}
              onChange={(e) => setDescricaoSolucao(e.target.value)}
              placeholder="Descreva o procedimento executado: diagnóstico realizado, desmontagem, ajustes, alinhamentos, solda, substituição de peças, regulagem e testes de validação..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Peças e Materiais Utilizados */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center">
              <Wrench className="w-3.5 h-3.5 mr-1 text-sky-400" />
              Peças, Componentes e Insumos Utilizados
            </label>
            <input
              type="text"
              value={pecasUtilizadas}
              onChange={(e) => setPecasUtilizadas(e.target.value)}
              placeholder="Ex: 2x Rolamento 6205, Retentor Sabó, 3L Óleo Hidráulico ISO 68..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Tipo de Manutenção e Tempo Gasto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center">
                <Layers className="w-3.5 h-3.5 mr-1 text-sky-400" />
                Tipo de Intervenção
              </label>
              <select
                value={tipoManutencao}
                onChange={(e) => setTipoManutencao(e.target.value as TipoManutencao)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="mecanica">Mecânica</option>
                <option value="eletrica">Elétrica</option>
                <option value="hidraulica">Hidráulica</option>
                <option value="pneumatica">Pneumática</option>
                <option value="ajuste_geral">Ajuste e Regulagem Geral</option>
                <option value="lubrificacao">Lubrificação Técnica</option>
                <option value="preventiva">Preventiva Periódica</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-sky-400" />
                Tempo de Intervenção (Minutos)
              </label>
              <input
                type="number"
                min="5"
                max="10000"
                step="5"
                value={tempoGastoMinutos}
                onChange={(e) => setTempoGastoMinutos(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Equivalente a {(tempoGastoMinutos / 60).toFixed(1)} horas
              </span>
            </div>
          </div>

          {/* Observações e Cuidados para a Operação */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center">
              <FileText className="w-3.5 h-3.5 mr-1 text-sky-400" />
              Observações Técnicas / Recomendações para o Operador
            </label>
            <input
              type="text"
              value={observacoesTecnicas}
              onChange={(e) => setObservacoesTecnicas(e.target.value)}
              placeholder="Ex: Verificar nível de óleo no início de cada turno; não ultrapassar limite de carga..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            Voltar
          </button>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{saving ? 'Registrando Encerramento...' : 'Confirmar e Encerrar Chamado'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
