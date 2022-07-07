import { IsAuthenticated, Login, Register } from "../DB/auth.js"
import { users } from "../DB/models.js"

const uuid_regex = /^[-\w-]+$/g;
const password_regex = "";
const name_regex = "";

export async function validateLogin(json) {
    //json.id
    //json.password

    let statusCode = 400;
    let body = composeError("bad request");

    if (json.id && json.password && typeof (json.id) === "string" && (json.id.length > 20 && json.id.length < 50) &&
        typeof (json.password) === "string" && (json.password.length > 8 && json.password.length < 30)) {

        let validUUID = matchRegex(uuid_regex, json.id);
        if (!validUUID) {
            return [statusCode, composeError("invalid uuid(id)")]
        }
        let validPasswordString = matchRegex(password_regex, json.password);
        if (!validPasswordString) {
            return [statusCode, composeError("invalid password string")]
        }

        let token = await Login(json.id, json.password);
        if (!token) {
            return [statusCode, composeError("invalid credentials")]
        }
        let user = await users.get(token.belongsTo)


        let result = { token, name: user.name }

        return [200, JSON.stringify(result)]
    }


    return [statusCode, body]
}

export async function validateRegister(json) {
    //json.name
    //json.password
    let statusCode = 400;
    let body = `{"error":"bad request"}`;

    if (json.name && json.password && typeof (json.name) === "string" && (json.name.length > 3 && json.name.length < 50) &&
        typeof (json.password) === "string" && (json.password.length > 8 && json.password.length < 30)) {

        let isNameValid = matchRegex(name_regex, json.name);
        if (!isNameValid) {
            return [statusCode, composeError("invalid name")]
        }
        let isPasswordValid = matchRegex(password_regex, json.password);
        if (!isPasswordValid) {
            return [statusCode, composeError("invalid password string")]
        }

        let token = await Register(json.name, json.password);
        if (!token) {
            return [statusCode, composeError("invalid credentials")]
        }

        return [200, JSON.stringify({ token, name: json.name })]
    }

    return [statusCode, body];
}

function matchRegex(regex, str) {
    // return regex.test(str)
    return true
}

function composeError(message) {
    return `{"error":"${message}"}`
}