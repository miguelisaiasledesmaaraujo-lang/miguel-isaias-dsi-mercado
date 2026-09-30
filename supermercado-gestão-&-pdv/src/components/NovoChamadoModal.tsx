import React, { useState } from 'react';
import { Chamado, ChamadoPrioridade, User } from '../types';
import { generateNextChamadoCode } from '../utils/formatters';
import { 
  X, 
  AlertTriangle, 
  Wrench, 
  Building2, 
  FileText, 
  Camera, 
  AlertOctagon, 
  Send,
  Sparkles
} from 'lucide-react';

interface NovoChamadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (chamado: Chamado) => Promise<void>;
  currentUser: User;
  existingCodes: string[];
}

const EQUIPAMENTOS_SUGERIDOS = [
  'Torno CNC Romi',
  'Prensa Hidráulica 60T',
  'Compressor Schulz 40HP',
  'Fresadora Universal',
  'Empilhadeira Yale Elétrica',
  'Injetora Plástica 150T',
  'Esteira Transportadora Linha 1',
  'Máquina de Solda MIG/MAG',
];

const SETORES_SUGERIDOS = [
  'Usinagem',
  'Estamparia',
  'Montagem',
  'Solda & Caldeiraria',
  'Expedição / Logística',
  'Pintura Industrial',
  'Utilidades & Compressores',
];

export const NovoChamadoModal: React.FC<NovoChamadoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentUser,
  existingCodes,
}) => {
  const [titulo, setTitulo] = useState('');
  const [equipamento, setEquipamento] = useState('');
  const [setor, setSetor] = useState('Usinagem');
  const [prioridade, setPrioridade] = useState<ChamadoPrioridade>('media');
  const [paradaMaquina, setParadaMaquina] = useState(false);
  const [descricaoProblema, setDescricaoProblema] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('A foto deve ter no máximo 3MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!equipamento.trim()) {
      setError('Por favor, informe qual é o equipamento ou máquina com defeito.');
      return;
    }

    if (!titulo.trim()) {
      setError('Informe um título resumo para o chamado.');
      return;
    }

    if (!descricaoProblema.trim() || descricaoProblema.trim().length < 10) {
      setError('A descrição detalhada do problema deve ter pelo menos 10 caracteres.');
      return;
    }

    setSaving(true);
    try {
      const novoCodigo = generateNextChamadoCode(existingCodes);
      const novoChamado: Chamado = {
        id: crypto.randomUUID ? crypto.randomUUID() : `chm-${Date.now()}`,
        codigo: novoCodigo,
        titulo: titulo.trim(),
        equipamento: equipamento.trim(),
        setor: setor.trim() || 'Geral',
        prioridade,
        status: 'aberto',
        parada_maquina: paradaMaquina,
        descricao_problema: descricaoProblema.trim(),
        foto_url: fotoUrl || undefined,
        operador_nome: currentUser.username,
        operador_id: currentUser.id,
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      };

      await onSave(novoChamado);
      onClose();
      // Reset form
      setTitulo('');
      setEquipamento('');
      setDescricaoProblema('');
      setFotoUrl('');
      setParadaMaquina(false);
      setPrioridade('media');
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar chamado.');
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
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Abertura de Chamado Técnico</h2>
              <p className="text-xs text-slate-400">
                Operador: <span className="text-amber-400 font-semibold">{currentUser.name}</span>
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

        {/* Content / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center space-x-2 text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Equipamento */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center">
                <Wrench className="w-3.5 h-3.5 mr-1 text-amber-400" />
                Máquina / Equipamento *
              </span>
              <span className="text-[10px] text-slate-500 lowercase font-normal">Identificação clara</span>
            </label>
            <input
              type="text"
              required
              value={equipamento}
              onChange={(e) => setEquipamento(e.target.value)}
              placeholder="Ex: Torno CNC Romi 02, Prensa 60T, Compressor..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            {/* Chips rápidos */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {EQUIPAMENTOS_SUGERIDOS.slice(0, 5).map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setEquipamento(item)}
                  className="px-2 py-1 text-[11px] rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition"
                >
                  + {item}
                </button>
              ))}
            </div>
          </div>

          {/* Setor & Título */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center">
                <Building2 className="w-3.5 h-3.5 mr-1 text-amber-400" />
                Setor / Linha *
              </label>
              <select
                value={setor}
                onChange={(e) => setSetor(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                {SETORES_SUGERIDOS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center">
                <FileText className="w-3.5 h-3.5 mr-1 text-amber-400" />
                Título do Problema *
              </label>
              <input
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Vazamento de óleo hidráulico"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Criticidade / Prioridade & Máquina Parada */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Nível de Criticidade / Prioridade
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    { id: 'baixa', label: 'Baixa', desc: 'Não afeta produção' },
                    { id: 'media', label: 'Média', desc: 'Aviso / ruído leve' },
                    { id: 'alta', label: 'Alta', desc: 'Risco de parada' },
                    { id: 'urgente', label: 'Urgente', desc: 'Máquina inoperante' },
                  ] as const
                ).map((p) => {
                  const active = prioridade === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPrioridade(p.id)}
                      className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                        active
                          ? p.id === 'urgente'
                            ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                            : p.id === 'alta'
                            ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                            : p.id === 'media'
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-xs font-bold uppercase">{p.label}</span>
                      <span className="text-[10px] opacity-75 mt-0.5">{p.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Checkbox Parada de Máquina */}
            <div className="pt-2 border-t border-slate-800">
              <label className="flex items-center space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={paradaMaquina}
                  onChange={(e) => {
                    setParadaMaquina(e.target.checked);
                    if (e.target.checked && prioridade === 'baixa') {
                      setPrioridade('alta');
                    }
                  }}
                  className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-rose-600 focus:ring-rose-500 focus:ring-offset-slate-950"
                />
                <div>
                  <span className="text-xs font-bold text-rose-400 flex items-center">
                    <AlertOctagon className="w-3.5 h-3.5 mr-1 text-rose-400" />
                    MÁQUINA TOTALMENTE PARADA / INTERRUPÇÃO DE LINHA
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Marque se a produção estiver travada devido a esta falha.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Descrição detalhada do problema */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center">
                <FileText className="w-3.5 h-3.5 mr-1 text-amber-400" />
                Informações Descritivas da Falha (O que aconteceu?) *
              </span>
              <span className="text-[10px] text-slate-500 lowercase">Detalhe os sintomas</span>
            </label>
            <textarea
              required
              rows={4}
              value={descricaoProblema}
              onChange={(e) => setDescricaoProblema(e.target.value)}
              placeholder="Descreva com detalhes o que está acontecendo: sons anormais, fumaça, cheiro de queimado, vazamento de óleo, erro no display, se travou repentinamente ou se vinha oscilando..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Anexo de Foto / Imagem do Defeito */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center">
                <Camera className="w-3.5 h-3.5 mr-1 text-amber-400" />
                Foto / Imagem do Defeito (Opcional)
              </span>
              {fotoUrl && (
                <button
                  type="button"
                  onClick={() => setFotoUrl('')}
                  className="text-[11px] text-rose-400 hover:underline"
                >
                  Remover foto
                </button>
              )}
            </label>

            {fotoUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-700 max-h-48 bg-slate-950 flex items-center justify-center">
                <img
                  src={fotoUrl}
                  alt="Anexo da falha"
                  className="object-contain max-h-48 w-full"
                />
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <label className="flex-1 flex items-center justify-center px-4 py-3 border border-dashed border-slate-700 rounded-xl hover:border-amber-500/60 bg-slate-950 cursor-pointer group transition">
                  <div className="flex items-center space-x-2 text-slate-400 group-hover:text-amber-300">
                    <Camera className="w-4 h-4" />
                    <span className="text-xs font-medium">Tirar Foto / Carregar Arquivo</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
                <div className="flex-1">
                  <input
                    type="url"
                    value={fotoUrl}
                    onChange={(e) => setFotoUrl(e.target.value)}
                    placeholder="Ou cole o link da imagem (URL)..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{saving ? 'Registrando Chamado...' : 'Abrir Chamado'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
