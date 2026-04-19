import { IModel } from "./Service.interface"

export interface IMsBengkel extends IModel {
  bengkelId: number
  bengkelName: string
}

export interface IMsEnvironment extends IModel {
  environmentId: number
  environmentName: string
}

export interface IBengkelModule extends IModel {
  bengkelModuleId: number
  bengkelId: number
  environmentId: number
  baseUrl: string
  basicAuth: string
  postmanEnv: JSON
}

export interface IBengkelDetail extends IModel {
  bengkelDetailId: number
  url: string
  description: string
  bengkelModuleId: number
  payload: JSON
}

export interface GetBengkelModulePayload {
  environmentId: number
  bengkelId: number
}

export interface GetBengkelDetailListPayload {
  bengkelId: number
  page: number
  size: number
  searchQuery: string
  sortBy?: keyof IBengkelDetail
  sortOrder?: "asc" | "desc"
}

export interface AddBengkelDetailPayload {
  url: string
  description: string
  bengkelId: number
  payload: JSON
}

export interface UpdateBengkelDetailPayload {
  bengkelDetailId: number
  url: string
  description: string
  payload: JSON
}

export interface UpdateBengkelModulePayload {
  bengkelModuleId: number
  baseUrl: string
  basicAuth: string
  postmanEnv?: JSON
}

export interface AddMsBengkelPayload {
  bengkelName: string
}

export interface UpdateMsBengkelPayload {
  bengkelId: number
  bengkelName: string
}
