import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { createClient } from "@supabase/supabase-js"
import type { AuthStatus } from "@/views/auth-page/AuthPage.type"
import { UserService } from "@/helpers/services/UserService"
import { IAuthenticatedUser } from "@/interfaces/User.interface"
import { InitialUserData } from "@/constants/User"

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
)

interface AuthContextType {
  user: any
  setUser: (val: any) => void
  profile: any
  setProfile: (val: any) => void
  loading: boolean
  authStatus: AuthStatus
  authMessage: string
  setAuthStatus: (val: AuthStatus) => void
  setAuthMessage: (val: string) => void
  handleLoginAuth: (email: string) => Promise<void>
  handleLogoutAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<IAuthenticatedUser | null>(InitialUserData)
  const [loading, setLoading] = useState(true)
  const [authStatus, setAuthStatus] = useState<AuthStatus>("idle")
  const [authMessage, setAuthMessage] = useState("")

  useEffect(() => {
    const init = async () => {
      setLoading(true)

      const params = new URLSearchParams(window.location.search)
      const token_hash = params.get("token_hash")
      const type = params.get("type")

      if (token_hash) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: (type as any) || "magiclink",
        })

        if (error) {
          setAuthStatus("error")
          setAuthMessage(error.message)
        } else {
          setAuthStatus("success")
          window.history.replaceState({}, document.title, "/")
        }
      }

      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      if (session?.user?.email) {
        const { data, error } = await UserService.getUserByEmail(session.user.email);
        if (error) {
          // handle error as needed
          return;
        }
        setProfile(data)
      } else {
        setProfile(null)
      }
      setLoading(false)
    }

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLoginAuth = async (email: string) => {
    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    })

    if (error) {
      setAuthStatus("error")
      setAuthMessage(error.message)
    } else {
      setAuthStatus("success")
      setAuthMessage("Check your email for the login link!")
    }

    setLoading(false)
  }

  const handleLogoutAuth = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setAuthStatus("idle")
    setAuthMessage("")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        profile,
        setProfile,
        loading,
        authStatus,
        authMessage,
        setAuthStatus,
        setAuthMessage,
        handleLoginAuth,
        handleLogoutAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}