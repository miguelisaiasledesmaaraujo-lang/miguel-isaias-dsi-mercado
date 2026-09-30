import React, { useState } from 'react';
import { User } from '../types';
import { authenticate } from '../lib/auth';
import { 
  Wrench, 
  HardHat, 
  ShieldCheck, 
  LogIn, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  KeyRound, 
  User as UserIcon,
  Database,
  ArrowRight
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
  onOpenSupabaseModal: () => void;
  isSupabaseConnected: boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onOpenSupabaseModal,
  isSupabaseConnected,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = authenticate(username, password);
    setIsSubmitting(false);

    if (result.success && result.user) {
      onLoginSuccess(result.user);
    } else {
      setError(result.error || 'Credenciais inválidas.');
    }
  };

  const handleQuickLogin = (role: 'operador' | 'mecanico') => {
    setError(null);
    if (role === 'operador') {
      setUsername('operador');
      setPassword('operador123');
      const res = authenticate('operador', 'operador123');
      if (res.success && res.user) onLoginSuccess(res.user);
    } else {
      setUsername('mecanico');
      setPassword('mecanico123');
      const res = authenticate('mecanico', 'mecanico123');
      if (res.success && res.user) onLoginSuccess(res.user);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Brand / Logo */}
        <div className="text-center">
          <div className="inline-flex p-3 bg-gradient-to-tr from-amber-600 to-amber-500 rounded-2xl shadow-xl shadow-amber-500/20 text-slate-950 mb-4">
            <Wrench className="w-8 h-8 text-slate-950 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Sistema de Chamados
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Abertura e Encerramento de Ordens de Manutenção
          </p>
        </div>

        {/* Quick Access Badges for Instant Testing */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
            <span>Acesso Rápido com 1 Clique</span>
            <span className="text-[10px] text-amber-400 font-mono">Credenciais configuradas</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Operador Card */}
            <button
              type="button"
              onClick={() => handleQuickLogin('operador')}
              className="group flex flex-col text-left p-3 rounded-lg bg-slate-800/80 hover:bg-amber-500/10 border border-slate-700 hover:border-amber-500/40 transition duration-150"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center text-xs font-bold text-amber-400 group-hover:text-amber-300">
                  <HardHat className="w-3.5 h-3.5 mr-1 text-amber-400" />
                  Operador
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition transform group-hover:translate-x-0.5" />
              </div>
              <div className="text-[11px] font-mono text-slate-300">
                operador <span className="text-slate-500">/</span> operador123
              </div>
              <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                Abre chamados e descreve falhas
              </div>
            </button>

            {/* Mecânico Card */}
            <button
              type="button"
              onClick={() => handleQuickLogin('mecanico')}
              className="group flex flex-col text-left p-3 rounded-lg bg-slate-800/80 hover:bg-blue-500/10 border border-slate-700 hover:border-blue-500/40 transition duration-150"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center text-xs font-bold text-sky-400 group-hover:text-sky-300">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-sky-400" />
                  Mecânico
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 transition transform group-hover:translate-x-0.5" />
              </div>
              <div className="text-[11px] font-mono text-slate-300">
                mecanico <span className="text-slate-500">/</span> mecanico123
              </div>
              <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                Encerra e relata o que foi feito
              </div>
            </button>
          </div>
        </div>

        {/* Standard Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-200">Entrar com credenciais</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Digite seu usuário e senha de operador ou mecânico
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-start space-x-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Usuário / Login
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ex: operador ou mecanico"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha..."
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSubmitting ? 'Verificando...' : 'Acessar Sistema'}</span>
            </button>
          </form>

          {/* Database Info footer */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center space-x-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSupabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span>
                {isSupabaseConnected
                  ? 'Supabase Conectado'
                  : 'Modo Local (Supabase Desconectado)'}
              </span>
            </div>
            <button
              onClick={onOpenSupabaseModal}
              className="text-amber-400 hover:text-amber-300 flex items-center space-x-1 font-semibold underline underline-offset-2"
            >
              <Database className="w-3 h-3" />
              <span>Configurar Supabase</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
