import { AuthStatus } from "@/views/auth-page/AuthPage.type"
import { IModel } from "./Service.interface"

export interface IAuthenticatedUser extends IModel {
  authenticatedUserId: number
  email: string
  isAdmin: boolean
}

export interface AuthContextType {
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

export interface  AddAuthenticatedUserPayload {
  email: string
  isAdmin: boolean
}

export interface  UpdateAuthenticatedUserRolePayload {
  authenticatedUserId: number
  isAdmin: boolean
}
