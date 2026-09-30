import React, { useState, useMemo } from 'react';
import { Chamado, User, ChamadoPrioridade, ChamadoStatus } from '../types';
import { ChamadoCard } from './ChamadoCard';
import { 
  Wrench, 
  AlertOctagon, 
  Clock, 
  CheckCircle2, 
  Search, 
  Filter, 
  PlusCircle, 
  HardHat, 
  ShieldCheck, 
  AlertTriangle,
  Layers,
  Sparkles,
  Inbox
} from 'lucide-react';

interface DashboardViewProps {
  chamados: Chamado[];
  currentUser: User;
  onOpenNovoChamado: () => void;
  onViewDetails: (chamado: Chamado) => void;
  onIniciarAtendimento: (chamado: Chamado) => void;
  onOpenEncerrar: (chamado: Chamado) => void;
  onDeleteChamado?: (chamadoId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  chamados,
  currentUser,
  onOpenNovoChamado,
  onViewDetails,
  onIniciarAtendimento,
  onOpenEncerrar,
  onDeleteChamado,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | ChamadoStatus>('todos');
  const [prioridadeFilter, setPrioridadeFilter] = useState<'todas' | ChamadoPrioridade>('todas');
  const [onlyStopped, setOnlyStopped] = useState(false);

  // KPIs
  const stats = useMemo(() => {
    const total = chamados.length;
    const abertos = chamados.filter((c) => c.status === 'aberto').length;
    const emAtendimento = chamados.filter((c) => c.status === 'em_atendimento').length;
    const encerrados = chamados.filter((c) => c.status === 'encerrado').length;
    const paradas = chamados.filter((c) => c.parada_maquina && c.status !== 'encerrado').length;

    // Tempo médio de reparo dos chamados encerrados
    const encerradosComTempo = chamados.filter(
      (c) => c.status === 'encerrado' && c.tempo_gasto_minutos && c.tempo_gasto_minutos > 0
    );
    const totalMinutos = encerradosComTempo.reduce((acc, c) => acc + (c.tempo_gasto_minutos || 0), 0);
    const mediaMinutos = encerradosComTempo.length > 0 ? Math.round(totalMinutos / encerradosComTempo.length) : 0;

    return { total, abertos, emAtendimento, encerrados, paradas, mediaMinutos };
  }, [chamados]);

  // Filtered Chamados
  const filteredChamados = useMemo(() => {
    return chamados.filter((c) => {
      // Text search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesCode = c.codigo.toLowerCase().includes(query);
        const matchesTitle = c.titulo.toLowerCase().includes(query);
        const matchesEquip = c.equipamento.toLowerCase().includes(query);
        const matchesSetor = c.setor.toLowerCase().includes(query);
        const matchesDesc = c.descricao_problema.toLowerCase().includes(query);
        const matchesSolucao = c.descricao_solucao?.toLowerCase().includes(query) || false;
        const matchesOp = c.operador_nome.toLowerCase().includes(query);
        const matchesMec = c.mecanico_nome?.toLowerCase().includes(query) || false;

        if (
          !matchesCode &&
          !matchesTitle &&
          !matchesEquip &&
          !matchesSetor &&
          !matchesDesc &&
          !matchesSolucao &&
          !matchesOp &&
          !matchesMec
        ) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'todos' && c.status !== statusFilter) {
        return false;
      }

      // Priority filter
      if (prioridadeFilter !== 'todas' && c.prioridade !== prioridadeFilter) {
        return false;
      }

      // Only stopped machines
      if (onlyStopped && !c.parada_maquina) {
        return false;
      }

      return true;
    });
  }, [chamados, searchTerm, statusFilter, prioridadeFilter, onlyStopped]);

  return (
    <div className="space-y-6">
      {/* Role Announcement Banner */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          currentUser.role === 'operador'
            ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/30'
            : 'bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border-blue-500/30'
        }`}
      >
        <div className="flex items-start space-x-3.5">
          <div
            className={`p-3 rounded-xl text-white font-bold shadow-lg ${
              currentUser.role === 'operador' ? 'bg-amber-600 shadow-amber-600/20' : 'bg-blue-600 shadow-blue-600/20'
            }`}
          >
            {currentUser.role === 'operador' ? (
              <HardHat className="w-6 h-6" />
            ) : (
              <ShieldCheck className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-bold text-white">
                Olá, {currentUser.name}!
              </h2>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                  currentUser.role === 'operador'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                }`}
              >
                Perfil: {currentUser.role === 'operador' ? 'Operador' : 'Mecânico'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {currentUser.role === 'operador' ? (
                <>
                  Você tem permissão para <strong>abrir novos chamados</strong> e detalhar informações descritivas de falhas nas máquinas e equipamentos para a equipe mecânica.
                </>
              ) : (
                <>
                  Você tem acesso à fila de manutenção para <strong>assumir ordens de serviço</strong> e <strong>encerrar os chamados</strong> descrevendo detalhadamente o que foi feito e peças utilizadas.
                </>
              )}
            </p>
          </div>
        </div>

        {currentUser.role === 'operador' ? (
          <button
            onClick={onOpenNovoChamado}
            className="shrink-0 flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Abrir Novo Chamado</span>
          </button>
        ) : (
          <div className="text-xs text-slate-400 bg-slate-950/60 px-3.5 py-2 rounded-xl border border-slate-800">
            <span className="font-semibold text-sky-400">Dica:</span> Clique em <strong>"Encerrar"</strong> no cartão para registrar o reparo.
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Geral</span>
            <Layers className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-white">{stats.total}</div>
          <span className="text-[10px] text-slate-500 mt-1">Ordens registradas</span>
        </div>

        {/* Abertos */}
        <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-4 flex flex-col justify-between bg-gradient-to-b from-amber-500/5 to-transparent">
          <div className="flex items-center justify-between text-amber-400 text-xs font-semibold">
            <span>Abertos (Fila)</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-400">{stats.abertos}</div>
          <span className="text-[10px] text-amber-400/70 mt-1">Aguardando atendimento</span>
        </div>

        {/* Em Atendimento */}
        <div className="bg-slate-900 border border-sky-500/30 rounded-xl p-4 flex flex-col justify-between bg-gradient-to-b from-sky-500/5 to-transparent">
          <div className="flex items-center justify-between text-sky-400 text-xs font-semibold">
            <span>Em Atendimento</span>
            <Wrench className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-sky-400">{stats.emAtendimento}</div>
          <span className="text-[10px] text-sky-400/70 mt-1">Em execução mecânica</span>
        </div>

        {/* Encerrados */}
        <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-4 flex flex-col justify-between bg-gradient-to-b from-emerald-500/5 to-transparent">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold">
            <span>Encerrados</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-400">{stats.encerrados}</div>
          <span className="text-[10px] text-emerald-400/70 mt-1">Solucionados com laudo</span>
        </div>

        {/* Máquinas Paradas */}
        <div
          className={`col-span-2 lg:col-span-1 rounded-xl p-4 flex flex-col justify-between border ${
            stats.paradas > 0
              ? 'bg-rose-950/30 border-rose-500/60 text-rose-300'
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold">
            <span className={stats.paradas > 0 ? 'text-rose-400 font-black' : 'text-slate-400'}>
              Máquinas Paradas
            </span>
            <AlertOctagon className={`w-4 h-4 ${stats.paradas > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
          </div>
          <div className={`mt-2 text-2xl font-black ${stats.paradas > 0 ? 'text-rose-400' : 'text-white'}`}>
            {stats.paradas}
          </div>
          <span className={`text-[10px] mt-1 ${stats.paradas > 0 ? 'text-rose-300 font-bold' : 'text-slate-500'}`}>
            {stats.paradas > 0 ? 'Impacto na linha fabril' : 'Linha operando normalmente'}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-lg">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código, equipamento, setor, problema, operador ou mecânico..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
            />
          </div>

          {/* Quick Selects */}
          <div className="flex items-center space-x-2 flex-wrap sm:flex-nowrap">
            {/* Priority Filter */}
            <select
              value={prioridadeFilter}
              onChange={(e) => setPrioridadeFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="todas">Todas as Prioridades</option>
              <option value="urgente">Urgente</option>
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>

            {/* Parada de Máquina Toggle */}
            <button
              onClick={() => setOnlyStopped(!onlyStopped)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition ${
                onlyStopped
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/60'
                  : 'bg-slate-950 text-slate-400 border-slate-700/80 hover:text-white'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Só Paradas</span>
            </button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto pb-1 border-t border-slate-800/80 pt-3 text-xs">
          {(
            [
              { id: 'todos', label: 'Todos', count: stats.total },
              { id: 'aberto', label: 'Abertos', count: stats.abertos },
              { id: 'em_atendimento', label: 'Em Atendimento', count: stats.emAtendimento },
              { id: 'encerrado', label: 'Encerrados', count: stats.encerrados },
            ] as const
          ).map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition whitespace-nowrap ${
                  active
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    active ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chamados Grid */}
      {filteredChamados.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Nenhum chamado encontrado</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Não encontramos nenhum chamado correspondente aos filtros selecionados. Tente ajustar os termos de busca ou filtros.
            </p>
          </div>
          {currentUser.role === 'operador' && (
            <button
              onClick={onOpenNovoChamado}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Abrir Primeiro Chamado</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredChamados.map((chamado) => (
            <ChamadoCard
              key={chamado.id}
              chamado={chamado}
              currentUser={currentUser}
              onViewDetails={onViewDetails}
              onIniciarAtendimento={onIniciarAtendimento}
              onOpenEncerrar={onOpenEncerrar}
              onDelete={onDeleteChamado}
            />
          ))}
        </div>
      )}
    </div>
  );
};
