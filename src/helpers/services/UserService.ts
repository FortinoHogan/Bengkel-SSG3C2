import { IResponse } from "@/interfaces/Service.interface"
import { supabase } from "../supabase/client"
import { IAuthenticatedUser } from "@/interfaces/User.interface"

type AddAuthenticatedUserPayload = {
  email: string
  isAdmin: boolean
}

type UpdateAuthenticatedUserRolePayload = {
  authenticatedUserId: number
  isAdmin: boolean
}

function getEmailRedirectUrl() {
  const configuredRedirect = import.meta.env.VITE_AUTH_REDIRECT_URL?.trim()

  if (!configuredRedirect) {
    return `${window.location.origin}/auth`
  }

  try {
    const parsed = new URL(configuredRedirect)
    return `${parsed.origin}/auth`
  } catch {
    return `${window.location.origin}/auth`
  }
}

const getAuthenticatedUserList = async (
  setIsLoading?: (val: boolean) => void
): Promise<IResponse<IAuthenticatedUser[]>> => {
  setIsLoading?.(true)
  try {
    const { data, error } = await supabase
      .from("AuthenticatedUser")
      .select("*")
      .order("created_at", { ascending: false })
      .order("authenticatedUserId", { ascending: false })

    return {
      data: data ? data : null,
      error: error ? error.message : null,
    }
  } catch (error) {
    return {
      data: null,
      error: (error as Error).message,
    }
  } finally {
    setIsLoading?.(false)
  }
}

const getUserByEmail = async (
  email: string,
  setIsLoading?: (val: boolean) => void
): Promise<IResponse<IAuthenticatedUser>> => {
  setIsLoading?.(true)
  try {
    const { data, error } = await supabase
      .from("AuthenticatedUser")
      .select("*")
      .eq("email", email)
      .single()

    return {
      data: data ? data : null,
      error: error ? error.message : null,
    }
  } catch (error) {
    return {
      data: null,
      error: (error as Error).message,
    }
  } finally {
    setIsLoading?.(false)
  }
}

const addAuthenticatedUser = async (
  payload: AddAuthenticatedUserPayload,
  setIsLoading?: (val: boolean) => void
): Promise<IResponse<IAuthenticatedUser>> => {
  setIsLoading?.(true)
  try {
    const { data, error } = await supabase
      .from("AuthenticatedUser")
      .insert(payload)
      .select("*")
      .single()

    return {
      data: data ? data : null,
      error: error ? error.message : null,
    }
  } catch (error) {
    return {
      data: null,
      error: (error as Error).message,
    }
  } finally {
    setIsLoading?.(false)
  }
}

const updateAuthenticatedUserRole = async (
  payload: UpdateAuthenticatedUserRolePayload,
  setIsLoading?: (val: boolean) => void
): Promise<IResponse<IAuthenticatedUser>> => {
  setIsLoading?.(true)
  try {
    const { authenticatedUserId, ...updatePayload } = payload
    const { data, error } = await supabase
      .from("AuthenticatedUser")
      .update(updatePayload)
      .eq("authenticatedUserId", authenticatedUserId)
      .select("*")
      .single()

    return {
      data: data ? data : null,
      error: error ? error.message : null,
    }
  } catch (error) {
    return {
      data: null,
      error: (error as Error).message,
    }
  } finally {
    setIsLoading?.(false)
  }
}

export const UserService = {
  getAuthenticatedUserList,
  getUserByEmail,
  addAuthenticatedUser,
  updateAuthenticatedUserRole,
}
