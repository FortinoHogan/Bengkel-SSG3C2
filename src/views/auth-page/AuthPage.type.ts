export type ClaimsData = {
  claims: { email?: string; sub?: string; [key: string]: any }
  header: any
  signature: any
} | null

export type AuthStatus = 'idle' | 'success' | 'error'