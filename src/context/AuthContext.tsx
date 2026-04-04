import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'tmap_admin_session'

interface AuthState {
  email: string | null
  token: string | null
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadSession(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { email: null, token: null }
    const parsed = JSON.parse(raw) as AuthState
    return parsed
  } catch {
    return { email: null, token: null }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(() => loadSession().email)
  const [token, setToken] = useState<string | null>(() => loadSession().token)

  const persist = useCallback((next: AuthState) => {
    if (next.token && next.email) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
    setEmail(next.email)
    setToken(next.token)
  }, [])

  const login = useCallback(async (e: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 400))
    if (!e.includes('@')) return false
    const fakeJwt = btoa(
      JSON.stringify({ sub: e, exp: Date.now() + 86400000 }),
    )
    persist({ email: e, token: fakeJwt })
    return true
  }, [persist])

  const logout = useCallback(() => {
    persist({ email: null, token: null })
  }, [persist])

  const value = useMemo(
    () => ({
      email,
      token,
      login,
      logout,
    }),
    [email, token, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
