import React from 'react';
import { User } from '../types';
import { 
  Wrench, 
  PlusCircle, 
  Database, 
  LogOut, 
  CheckCircle2, 
  AlertCircle,
  HardHat,
  ShieldCheck
} from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  onOpenNovoChamado: () => void;
  onOpenSupabaseModal: () => void;
  isSupabaseConnected: boolean;
  totalAbertos: number;
  maquinasParadas: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  onOpenNovoChamado,
  onOpenSupabaseModal,
  isSupabaseConnected,
  totalAbertos,
  maquinasParadas,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Title */}
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-600 to-amber-500 rounded-xl shadow-lg shadow-amber-500/20 text-slate-950 font-black flex items-center justify-center">
              <Wrench className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  MANUTENÇÃO INDUSTRIAL
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 rounded border border-slate-700">
                  Chamados & O.S.
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden md:block">
                Gestão Operacional de Ordens de Serviço
              </p>
            </div>
          </div>

          {/* Indicators & Right Actions */}
          <div className="flex items-center space-x-3">
            {/* Supabase Status Pill */}
            <button
              onClick={onOpenSupabaseModal}
              title="Configuração do Banco de Dados Supabase"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                isSupabaseConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Supabase:</span>
              <span className="font-semibold">
                {isSupabaseConnected ? 'Conectado' : 'Configurar'}
              </span>
              {isSupabaseConnected ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-400 ml-0.5" />
              ) : (
                <AlertCircle className="w-3 h-3 text-amber-400 ml-0.5" />
              )}
            </button>

            {/* Quick Button: Novo Chamado (Available for Operador or any logged user) */}
            {currentUser && (
              <button
                onClick={onOpenNovoChamado}
                className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 transition active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Abrir Chamado</span>
              </button>
            )}

            {/* User Profile & Role Info */}
            {currentUser && (
              <div className="flex items-center pl-2 border-l border-slate-800 space-x-2">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow ${
                      currentUser.role === 'operador' ? 'bg-amber-600' : 'bg-blue-600'
                    }`}
                  >
                    {currentUser.role === 'operador' ? (
                      <HardHat className="w-4 h-4" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="text-xs font-semibold text-slate-200 leading-tight">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center space-x-1">
                      <span
                        className={`inline-block w-1.5 h-1.5 rounded-full ${
                          currentUser.role === 'operador' ? 'bg-amber-400' : 'bg-blue-400'
                        }`}
                      />
                      <span>{currentUser.role === 'operador' ? 'Operador' : 'Mecânico'}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  title="Sair / Trocar de Usuário"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
