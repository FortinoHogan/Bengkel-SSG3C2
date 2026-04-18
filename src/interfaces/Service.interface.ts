export interface IResponse<T> {
  data: T | null
  error: string | null
}

export interface IModel {
  createdAt?: string
}
