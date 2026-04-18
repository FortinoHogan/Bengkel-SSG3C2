import { IResponse } from "@/interfaces/Service.interface"
import { supabase } from "../supabase/client"
import { IAuthenticatedUser } from "@/interfaces/User.interface"

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

export const UserService = {
  getUserByEmail,
}
