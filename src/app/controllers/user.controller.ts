import IController from "IController";
import userService from "../services/user.service";

const createUser: IController = async(req, res) => {

    userService.createUser(req.body)
        .then((userId) => {
             return res.send(`User created successfully. userId: ${userId}`)
        })
        .catch((err) => {
            return res.status(err.statusCode).send(err.message)
        })
}

const login: IController = async (req, res) => {
    try{
        if (req.session.email && req.session.email === req.body.email) {
            return res.send(`User already logged in.`)
        }
        const email = req.body.email
        const password = req.body.password
        const user = await userService.login(email, password)
        req.session.userId = user.id;
        req.session.email = user.email
        return res.send(`Login successful. Welcome ${user.userName}!`)
    } catch(err) {
        console.log(`Login failed. Error: ${err}`)
        return res.status(err.statusCode).send(`Login failed. Check credentials and try again.`)
    }
}
const adminLogin: IController = async (req, res) => {
    try{
        if (req.session.email && req.session.email === req.body.email) {
            return res.send(`Admin already logged in.`)
        }
        const email = req.body.email
        const password = req.body.password
        const user = await userService.adminLogin(email, password)
        req.session.userId = user.id;
        req.session.email = user.email
        return res.send(`Login successful. Welcome ${user.userName}!`)
    } catch(err) {
        console.log(`Login failed. Error: ${err}`)
        return res.status(err.statusCode).send(`Login failed. Check credentials and try again.`)
    }
}

export default{
    createUser,
    login,
    adminLogin
}