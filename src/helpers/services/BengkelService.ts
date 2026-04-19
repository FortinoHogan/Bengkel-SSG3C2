import { IResponse } from "@/interfaces/Service.interface"
import { supabase } from "../supabase/client"
import {
  AddBengkelDetailPayload,
  AddMsBengkelPayload,
  GetBengkelDetailListPayload,
  GetBengkelModulePayload,
  IBengkelDetail,
  IBengkelModule,
  IMsBengkel,
  IMsEnvironment,
  UpdateBengkelDetailPayload,
  UpdateBengkelModulePayload,
  UpdateMsBengkelPayload,
} from "@/interfaces/Bengkel.interface"

const getMasterBengkelList = async (
  setIsLoading?: (val: boolean) => void
): Promise<IResponse<IMsBengkel[]>> => {
  try {
    setIsLoading?.(true)
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
    setIsLoading?.(true)

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

const getBengkelModuleList = async (
  bengkelId: number,
  setIsLoading?: (val: boolean) => void
): Promise<IResponse<IBengkelModule[]>> => {
  try {
    setIsLoading?.(true)
    const { data, error } = await supabase
      .from("BengkelModule")
      .select("*")
      .eq("bengkelId", bengkelId)
      .order("bengkelModuleId", { ascending: true })

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
  payload: GetBengkelModulePayload,
  setIsLoading?: (val: boolean) => void
): Promise<IResponse<IBengkelModule>> => {
  try {
    setIsLoading?.(true)
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

const getBengkelDetailList = async (
  payload: GetBengkelDetailListPayload,
  setIsLoading?: (val: boolean) => void
): Promise<IResponse<IBengkelDetail[]>> => {
  try {
    setIsLoading?.(true)
    let query = supabase
      .from("BengkelDetail")
      .select("*")
      .eq("bengkelId", payload.bengkelId)
      .range((payload.page - 1) * payload.size, payload.page * payload.size - 1)
      .order("created_at", { ascending: false })
      .order("bengkelDetailId", { ascending: false })

    if (payload.searchQuery.trim()) {
      query = query.or(
        `description.ilike.%${payload.searchQuery}%,url.ilike.%${payload.searchQuery}%`
      )
    }

    if (payload.sortBy) {
      query = query.order(payload.sortBy, {
        ascending: payload.sortOrder !== "desc",
      })
    }

    const { data, error } = await query

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

const updateBengkelDetail = async (
  payload: UpdateBengkelDetailPayload,
  setIsLoading?: (val: boolean) => void
) => {
  try {
    setIsLoading?.(true)
    const { bengkelDetailId, ...updatePayload } = payload
    const { data, error } = await supabase
      .from("BengkelDetail")
      .update(updatePayload)
      .eq("bengkelDetailId", bengkelDetailId)
      .select("bengkelDetailId")
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

const deleteBengkelDetail = async (
  bengkelDetailId: number,
  setIsLoading?: (val: boolean) => void
) => {
  try {
    setIsLoading?.(true)
    const { data, error } = await supabase
      .from("BengkelDetail")
      .delete()
      .eq("bengkelDetailId", bengkelDetailId)

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

const updateBengkelModule = async (
  payload: UpdateBengkelModulePayload,
  setIsLoading?: (val: boolean) => void
) => {
  try {
    setIsLoading?.(true)
    const { bengkelModuleId, ...updatePayload } = payload
    const { data, error } = await supabase
      .from("BengkelModule")
      .update(updatePayload)
      .eq("bengkelModuleId", bengkelModuleId)
      .select("bengkelModuleId")
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

const addMasterBengkel = async (
  payload: AddMsBengkelPayload,
  setIsLoading?: (val: boolean) => void
): Promise<IResponse<IMsBengkel>> => {
  try {
    setIsLoading?.(true)
    const { data, error } = await supabase
      .from("MsBengkel")
      .insert(payload)
      .select()
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

const updateMasterBengkel = async (
  payload: UpdateMsBengkelPayload,
  setIsLoading?: (val: boolean) => void
): Promise<IResponse<IMsBengkel>> => {
  try {
    setIsLoading?.(true)
    const { bengkelId, ...updatePayload } = payload
    const { data, error } = await supabase
      .from("MsBengkel")
      .update(updatePayload)
      .eq("bengkelId", bengkelId)
      .select()
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

export const BengkelService = {
  getMasterBengkelList,
  getMasterBengkel,
  getMasterEnvironmentList,
  addMasterBengkel,
  updateMasterBengkel,
  getBengkelModuleList,
  getBengkelModule,
  getBengkelDetailList,
  addBengkelDetail,
  updateBengkelDetail,
  deleteBengkelDetail,
  updateBengkelModule,
}
