import userRepository from "../repositories/user.repository"
import { UserModel } from '../models/user.model'
import userUtils from "../utils/user.utils"
import { DuplicateItemError } from "../errors/duplicate.item.error"
import { NotFoundError } from "../errors/not.found.error"
import { BadRequestError } from "../errors/bad.request.error"
import { UserTypes } from "../constants/enums/user.types"

const createUser = async (requestBody: any) => {
    const userModel = {} as UserModel
    const user = await userUtils.mapRequestBodyToUserModel(requestBody, userModel)

    const currentUser = await userRepository.getUserByEmail(user.email)
    if (currentUser) {
        throw new DuplicateItemError(`user already exists with email: ${JSON.stringify(currentUser)}`)
    }
    const newUser = await userRepository.createUser(user)
    console.log(`created user: ${JSON.stringify(newUser)}`)
    return newUser.id;
}

const login = async (email: string, password: string) => {
    const currentUser = await userRepository.getUserByEmail(email)
    if (!currentUser) {
        throw new NotFoundError(`No user found with email: ${email}`)
    }
    if (currentUser.password !== password && currentUser.type === UserTypes.USER) {
        throw new BadRequestError(`Invalid password: ${password}`)
    }
    console.log(`logged in user: ${currentUser.userName}`)
    return currentUser;
}

const adminLogin = async (email: string, password: string) => {
    const currentUser = await userRepository.getUserByEmail(email)
    if (!currentUser) {
        throw new NotFoundError(`No user found with email: ${email}`)
    }
    if (currentUser.password !== password) {
        throw new BadRequestError(`Invalid password: ${password}`)
    }
    if (currentUser.type !== UserTypes.ADMIN_USER) {
        throw new BadRequestError(`user: ${email} is not admin`)
    }
    console.log(`logged in user: ${currentUser.userName}`)
    return currentUser;
}

const getUserById = async (userId: number) => {
    const user = await userRepository.getUserById(userId)
    return user
}

export default {
    createUser,
    login,
    adminLogin,
    getUserById
}