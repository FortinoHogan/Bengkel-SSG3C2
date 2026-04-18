import { IResponse } from "@/interfaces/Service.interface"
import { supabase } from "../supabase/client"
import {
    AddBengkelDetailPayload,
  GetBengkelModuleListPayload,
  IBengkelDetail,
  IBengkelModule,
  IMsBengkel,
  IMsEnvironment,
} from "@/interfaces/Bengkel.interface"

const getMasterBengkelList = async (
  setIsLoading?: (val: boolean) => void
): Promise<IResponse<IMsBengkel[]>> => {
  try {
    const { data, error } = await supabase.from("MsBengkel").select("*")
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

const getMasterBengkel = async (
  id: number,
  setIsLoading?: (val: boolean) => void
) => {
  try {
    setIsLoading?.(true)
    const { data, error } = await supabase
      .from("MsBengkel")
      .select("*")
      .eq("bengkelId", id)
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

const getMasterEnvironmentList = async (
  setIsLoading?: (val: boolean) => void
): Promise<IResponse<IMsEnvironment[]>> => {
  try {
    const { data, error } = await supabase.from("MsEnvironment").select("*")
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

const getBengkelModule = async (
  payload: GetBengkelModuleListPayload,
  setIsLoading?: (val: boolean) => void
): Promise<IResponse<IBengkelModule>> => {
  try {
    const { data, error } = await supabase
      .from("BengkelModule")
      .select("*")
      .eq("environmentId", payload.environmentId)
      .eq("bengkelId", payload.bengkelId)
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

const addBengkelDetail = async (
  payload: AddBengkelDetailPayload,
  setIsLoading?: (val: boolean) => void
) => {
  try {
    setIsLoading?.(true)
    const { data, error } = await supabase.from("BengkelDetail").insert(payload)
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

export const BengkelService = {
  getMasterBengkelList,
  getMasterBengkel,
  getMasterEnvironmentList,
  getBengkelModule,
  addBengkelDetail,
}
