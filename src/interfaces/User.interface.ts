import { IModel } from "./Service.interface"

export interface IAuthenticatedUser extends IModel {
  authenticatedUserId: number
  email: string
  isAdmin: boolean
}
