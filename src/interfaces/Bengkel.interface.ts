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

export interface GetBengkelModuleListPayload {
  environmentId: number
  bengkelId: number
}

export interface GetBengkelDetailListPayload {
  bengkelModuleId: number
}

export interface AddBengkelDetailPayload {
  url: string
  description: string
  bengkelModuleId: number
  payload: JSON
}