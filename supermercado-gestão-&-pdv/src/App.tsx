import React, { useState, useEffect, useCallback } from 'react';
import { Chamado, User } from './types';
import { getStoredUser, clearUserSession, saveUserSession } from './lib/auth';
import { 
  fetchChamados, 
  persistChamado, 
  deleteChamado, 
  getLocalChamados 
} from './lib/storage';
import { testSupabaseConnection, getStoredSupabaseConfig } from './lib/supabase';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { NovoChamadoModal } from './components/NovoChamadoModal';
import { EncerrarChamadoModal } from './components/EncerrarChamadoModal';
import { DetalhesChamadoModal } from './components/DetalhesChamadoModal';
import { SupabaseModal } from './components/SupabaseModal';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);

  // Modals state
  const [isNovoChamadoModalOpen, setIsNovoChamadoModalOpen] = useState(false);
  const [isEncerrarModalOpen, setIsEncerrarModalOpen] = useState(false);
  const [isDetalhesModalOpen, setIsDetalhesModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [selectedChamado, setSelectedChamado] = useState<Chamado | null>(null);

  // Check stored auth session
  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  // Load Chamados and test Supabase connection
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Test Supabase connection
      const cfg = getStoredSupabaseConfig();
      if (cfg.url && cfg.anonKey) {
        const testRes = await testSupabaseConnection(cfg);
        setIsSupabaseConnected(testRes.success && testRes.tablesFound === true);
      } else {
        setIsSupabaseConnected(false);
      }

      // 2. Load tickets from Supabase or LocalStorage
      const list = await fetchChamados();
      setChamados(list);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setChamados(getLocalChamados());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auth Handlers
  const handleLoginSuccess = (user: User) => {
    saveUserSession(user);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    clearUserSession();
    setCurrentUser(null);
  };

  // Ticket Operations
  const handleSaveNovoChamado = async (novoChamado: Chamado) => {
    const saved = await persistChamado(novoChamado);
    setChamados((prev) => [saved, ...prev]);
  };

  const handleIniciarAtendimento = async (chamado: Chamado) => {
    if (!currentUser) return;
    const atualizado: Chamado = {
      ...chamado,
      status: 'em_atendimento',
      mecanico_nome: currentUser.username,
      mecanico_id: currentUser.id,
      iniciado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    };

    const saved = await persistChamado(atualizado);
    setChamados((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
    if (selectedChamado?.id === saved.id) {
      setSelectedChamado(saved);
    }
  };

  const handleEncerrarChamado = async (
    chamadoId: string,
    dados: {
      mecanico_nome: string;
      mecanico_id: string;
      descricao_solucao: string;
      pecas_utilizadas?: string;
      tempo_gasto_minutos?: number;
      tipo_manutencao?: string;
      observacoes_tecnicas?: string;
    }
  ) => {
    const alvo = chamados.find((c) => c.id === chamadoId);
    if (!alvo) return;

    const encerrado: Chamado = {
      ...alvo,
      status: 'encerrado',
      mecanico_nome: dados.mecanico_nome,
      mecanico_id: dados.mecanico_id,
      descricao_solucao: dados.descricao_solucao,
      pecas_utilizadas: dados.pecas_utilizadas,
      tempo_gasto_minutos: dados.tempo_gasto_minutos,
      tipo_manutencao: dados.tipo_manutencao,
      observacoes_tecnicas: dados.observacoes_tecnicas,
      encerrado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    };

    const saved = await persistChamado(encerrado);
    setChamados((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
    if (selectedChamado?.id === saved.id) {
      setSelectedChamado(saved);
    }
  };

  const handleDeleteChamado = async (chamadoId: string) => {
    if (!confirm('Deseja realmente excluir este chamado?')) return;
    await deleteChamado(chamadoId);
    setChamados((prev) => prev.filter((c) => c.id !== chamadoId));
    if (selectedChamado?.id === chamadoId) {
      setIsDetalhesModalOpen(false);
      setSelectedChamado(null);
    }
  };

  const handleOpenEncerrarModal = (chamado: Chamado) => {
    setSelectedChamado(chamado);
    setIsEncerrarModalOpen(true);
  };

  const handleOpenDetalhesModal = (chamado: Chamado) => {
    setSelectedChamado(chamado);
    setIsDetalhesModalOpen(true);
  };

  const totalAbertos = chamados.filter((c) => c.status === 'aberto').length;
  const maquinasParadas = chamados.filter((c) => c.parada_maquina && c.status !== 'encerrado').length;
  const existingCodes = chamados.map((c) => c.codigo);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenNovoChamado={() => setIsNovoChamadoModalOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        isSupabaseConnected={isSupabaseConnected}
        totalAbertos={totalAbertos}
        maquinasParadas={maquinasParadas}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
            <p className="text-sm font-medium text-slate-400">
              Carregando sistema de chamados...
            </p>
          </div>
        ) : !currentUser ? (
          /* When user is not authenticated -> show Login Screen */
          <LoginView
            onLoginSuccess={handleLoginSuccess}
            onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
            isSupabaseConnected={isSupabaseConnected}
          />
        ) : (
          /* When user is authenticated -> show Dashboard with full ticketing features */
          <DashboardView
            chamados={chamados}
            currentUser={currentUser}
            onOpenNovoChamado={() => setIsNovoChamadoModalOpen(true)}
            onViewDetails={handleOpenDetalhesModal}
            onIniciarAtendimento={handleIniciarAtendimento}
            onOpenEncerrar={handleOpenEncerrarModal}
            onDeleteChamado={handleDeleteChamado}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Sistema Integrado de Chamados e Manutenção Mecânica</span>
          <span className="flex items-center space-x-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabaseConnected ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span>{isSupabaseConnected ? 'Supabase Conectado' : 'Armazenamento Local Pronto'}</span>
          </span>
        </div>
      </footer>

      {/* Modal: Abertura de Novo Chamado (Operador) */}
      {currentUser && (
        <NovoChamadoModal
          isOpen={isNovoChamadoModalOpen}
          onClose={() => setIsNovoChamadoModalOpen(false)}
          onSave={handleSaveNovoChamado}
          currentUser={currentUser}
          existingCodes={existingCodes}
        />
      )}

      {/* Modal: Encerramento do Chamado (Mecânico - descrever o que foi feito) */}
      {currentUser && (
        <EncerrarChamadoModal
          isOpen={isEncerrarModalOpen}
          onClose={() => {
            setIsEncerrarModalOpen(false);
            setSelectedChamado(null);
          }}
          chamado={selectedChamado}
          onEncerrar={handleEncerrarChamado}
          currentUser={currentUser}
        />
      )}

      {/* Modal: Detalhes do Chamado / Ordem de Serviço */}
      {currentUser && (
        <DetalhesChamadoModal
          isOpen={isDetalhesModalOpen}
          onClose={() => {
            setIsDetalhesModalOpen(false);
            setSelectedChamado(null);
          }}
          chamado={selectedChamado}
          currentUser={currentUser}
          onOpenEncerrar={(chm) => {
            setIsDetalhesModalOpen(false);
            handleOpenEncerrarModal(chm);
          }}
          onIniciarAtendimento={handleIniciarAtendimento}
        />
      )}

      {/* Modal: Configuração do Supabase */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConnectionChange={(connected) => setIsSupabaseConnected(connected)}
        onDataRefresh={loadData}
      />
    </div>
  );
}
