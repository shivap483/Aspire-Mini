import db from "../config/db"
import { UserTypes } from "../constants/enums/user.types";
import { User } from "../entities/user.entity";
import { UserModel } from "../models/user.model";

const generateUserId = async() => {
    return db.users.size + 1;
}

const mapUserModel = async(newUser: User, userModel: UserModel) => {
    newUser.id = await generateUserId()
    newUser.userName = userModel.name
    newUser.email = userModel.email
    newUser.password = userModel.password
    newUser.type = userModel.type
    if(userModel.type === UserTypes.ADMIN_USER) {
        newUser.loans = null
    } else {
        newUser.loans = []
    }
}

const mapRequestBodyToUserModel = async(reqBody: any, userModel: UserModel) => {
    userModel.name = reqBody.name
    userModel.email = reqBody.email
    userModel.password = reqBody.password
    userModel.type = reqBody.type
    return userModel;
}

export default {
    mapUserModel,
    mapRequestBodyToUserModel
}