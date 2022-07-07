import { randomUUID } from "crypto"
import { makeHash } from "../utils.js";
import { db } from "./db.js"
import { Token, User, tokens, users } from "./models.js"

async function Login(userID, password) {
    let res = await users.get(userID)
    let token = null;
    if (res && res.password === makeHash(password)) {
        token = await tokens.create(userID);
    }
    console.log("== new Token ==");
    console.log(token);
    return token;
}

async function Register(name, password) {
    let user = await users.create(name, password)
    let token = null;
    if (user) {
        token = await tokens.create(user.id)
    }
    return token
}

async function IsAuthenticated(tokenID) {
    return await tokens.get(tokenID) ? true : false
}



export {
    IsAuthenticated,
    Login,
    Register
}