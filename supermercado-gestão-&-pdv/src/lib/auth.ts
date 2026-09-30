import { User } from '../types';

export const PRESET_USERS: Record<string, { password: string; user: User }> = {
  operador: {
    password: 'operador123',
    user: {
      id: 'usr-operador-1',
      username: 'operador',
      name: 'Carlos Oliveira',
      role: 'operador',
      cargo: 'Operador de Produção',
      avatarColor: 'bg-amber-600',
    },
  },
  mecanico: {
    password: 'mecanico123',
    user: {
      id: 'usr-mecanico-1',
      username: 'mecanico',
      name: 'Roberto Souza',
      role: 'mecanico',
      cargo: 'Mecânico de Manutenção',
      avatarColor: 'bg-blue-600',
    },
  },
};

const AUTH_STORAGE_KEY = 'chamados_auth_user';

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Erro ao ler usuário salvo:', e);
  }
  return null;
}

export function saveUserSession(user: User): void {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Erro ao salvar sessão:', e);
  }
}

export function clearUserSession(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (e) {
    console.error('Erro ao limpar sessão:', e);
  }
}

export function authenticate(username: string, password: string): { success: boolean; user?: User; error?: string } {
  const normalizedUser = username.trim().toLowerCase();
  const preset = PRESET_USERS[normalizedUser];

  if (!preset) {
    return {
      success: false,
      error: 'Usuário não encontrado. Use "operador" ou "mecanico".',
    };
  }

  if (preset.password !== password.trim()) {
    return {
      success: false,
      error: 'Senha incorreta para o usuário informado.',
    };
  }

  saveUserSession(preset.user);
  return {
    success: true,
    user: preset.user,
  };
}
