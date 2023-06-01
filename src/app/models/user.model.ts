import { UserTypes } from "../constants/enums/user.types";


export interface UserModel {
    name: string,
    email: string,
    password: string,
    type: UserTypes,
}