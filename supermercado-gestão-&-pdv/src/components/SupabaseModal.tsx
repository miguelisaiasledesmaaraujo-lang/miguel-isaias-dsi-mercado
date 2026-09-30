import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  Check, 
  Copy, 
  RefreshCw, 
  Download, 
  Upload, 
  AlertCircle, 
  CheckCircle2, 
  Server,
  FileCode
} from 'lucide-react';
import { 
  getStoredSupabaseConfig, 
  saveSupabaseConfig, 
  clearSupabaseConfig, 
  testSupabaseConnection, 
  SUPABASE_SQL_SCHEMA 
} from '../lib/supabase';
import { 
  syncLocalChamadosToSupabase, 
  getLocalChamados, 
  saveLocalChamados 
} from '../lib/storage';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionChange: (connected: boolean) => void;
  onDataRefresh?: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  onConnectionChange,
  onDataRefresh,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; tablesFound?: boolean } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const cfg = getStoredSupabaseConfig();
      setUrl(cfg.url);
      setAnonKey(cfg.anonKey);
      setTestResult(null);
      setSyncStatus(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setTestResult(null);

    const config = { url: url.trim(), anonKey: anonKey.trim() };
    saveSupabaseConfig(config);

    const result = await testSupabaseConnection(config);
    setTestResult(result);
    setIsTesting(false);
    onConnectionChange(result.success && result.tablesFound === true);
  };

  const handleDisconnect = () => {
    clearSupabaseConfig();
    setUrl('');
    setAnonKey('');
    setTestResult(null);
    onConnectionChange(false);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    const res = await syncLocalChamadosToSupabase();
    setIsSyncing(false);
    setSyncStatus(res.message);
    if (res.success && onDataRefresh) {
      onDataRefresh();
    }
  };

  const handleExportBackup = () => {
    const data = {
      system: 'chamados_manutencao',
      version: '1.0',
      exported_at: new Date().toISOString(),
      chamados: getLocalChamados(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const fileUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = `backup_chamados_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(fileUrl);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.chamados && Array.isArray(json.chamados)) {
          saveLocalChamados(json.chamados);
          alert('Backup importado com sucesso!');
          if (onDataRefresh) onDataRefresh();
        } else {
          alert('Arquivo de backup inválido.');
        }
      } catch (err) {
        alert('Erro ao importar backup: formato JSON inválido.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Integração com Supabase (Banco de Dados)</h3>
              <p className="text-xs text-slate-400">
                Conecte seu projeto Supabase para persistir chamados, aberturas e resoluções mecânicas
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

        <div className="p-6 space-y-6 max-h-[calc(85vh-120px)] overflow-y-auto">
          {/* Status Banner */}
          <div className="p-4 rounded-xl border bg-slate-950/60 border-slate-800 text-sm">
            <div className="flex items-start gap-3">
              <Server className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-white">Armazenamento em Nuvem & Local:</p>
                <p className="text-slate-300 text-xs leading-relaxed">
                  O sistema está 100% pronto para guardar todas as informações de chamados abertos pelos operadores e fechados pelos mecânicos. Ao conectar suas credenciais do Supabase, qualquer registro é salvo diretamente na nuvem!
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleTestAndSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Supabase Project URL
              </label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://seu-projeto.supabase.co"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Supabase Anon / Public API Key
              </label>
              <input
                type="password"
                required
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Encontrada em: <b>Supabase Dashboard &gt; Project Settings &gt; API &gt; anon public</b>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={isTesting}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-sm font-bold shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
              >
                {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                <span>{isTesting ? 'Testando Conexão...' : 'Salvar & Conectar Supabase'}</span>
              </button>

              {url && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-800 rounded-lg text-sm font-medium transition-colors"
                >
                  Desconectar
                </button>
              )}
            </div>
          </form>

          {/* Test Result Message */}
          {testResult && (
            <div
              className={`p-4 rounded-xl border text-sm flex items-start gap-3 ${
                testResult.success
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-semibold">{testResult.success ? 'Conexão Verificada!' : 'Falha na Conexão'}</p>
                <p className="text-xs leading-relaxed opacity-90">{testResult.message}</p>
              </div>
            </div>
          )}

          {/* Sincronização e Backup */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-400" />
              Sincronização e Exportação de Backup
            </h4>
            <p className="text-xs text-slate-400">
              Criou chamados antes de conectar o Supabase? Envie-os para a tabela da sua conta ou exporte um arquivo de segurança:
            </p>
            
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleSyncToSupabase}
                disabled={isSyncing || !url}
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-white transition disabled:opacity-40"
              >
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>{isSyncing ? 'Sincronizando...' : 'Subir chamados locais para o Supabase'}</span>
              </button>

              <button
                type="button"
                onClick={handleExportBackup}
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" />
                <span>Exportar Backup (JSON)</span>
              </button>

              <label className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-300 hover:text-white cursor-pointer transition">
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Importar Backup (JSON)</span>
                <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
              </label>
            </div>

            {syncStatus && (
              <p className="text-xs text-emerald-400 mt-2 font-medium bg-emerald-950/30 p-2 rounded border border-emerald-800/40">
                {syncStatus}
              </p>
            )}
          </div>

          {/* SQL Script Accordion */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-400" />
                <span>Script SQL para o Supabase (Tabela "chamados")</span>
              </h4>
              <button
                type="button"
                onClick={handleCopySql}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-md text-xs font-semibold transition"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copiado para Área de Transferência!' : 'Copiar Script SQL'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Cole e execute o código abaixo no <strong>SQL Editor</strong> do painel do seu projeto Supabase para criar a estrutura pronta:
            </p>

            <div className="relative">
              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-emerald-300/90 overflow-x-auto max-h-56 leading-relaxed">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
