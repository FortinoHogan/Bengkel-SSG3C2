export interface IResponse<T> {
  data: T | null
  error: string | null
}

export interface IModel {
  created_at?: string
}
