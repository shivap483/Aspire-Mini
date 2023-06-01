import { EntityRepository, Repository } from "typeorm";
import { User } from "../entities/user.entity";
import db from "../config/db";
import userUtils from '../utils/user.utils'
import { UserModel } from "../models/user.model";



const createUser = async(user: UserModel) => {
    const newUser = new User()
    await userUtils.mapUserModel(newUser, user)
    db.users.set(newUser.id, newUser)
    return newUser
}

const getUserByEmail = async (email: string) => {
    const users = Array.from(db.users.values());
        var currentUser: User;
        for(const user of users) {
            if(user.email === email){
                currentUser = user;
                break;
            }
        }
        return currentUser
}

const getUserById = async(id: number) => {
    const user = await db.users.get(id)
    return user
}

export default {
    createUser,
    getUserByEmail,
    getUserById
}
