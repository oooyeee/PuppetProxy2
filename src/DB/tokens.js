import { EventEmitter } from "events"
import { randomUUID } from "crypto"
import { db, insertMultiple, insertOne } from "./db.js"

const expiration_time = 10 * 60 * 1000;

class Token {
    constructor({ userID, id }) {
        this.id = id;
        this.created = Date.now()
        this.expires = this.created + expiration_time;
        this.belongsTo = userID
    }
}

// in memory Sqlite table
let tokens = {};


let tokenEvents = new EventEmitter();

function onDeleteToken_helper(tokenID) {
    setTimeout(async () => {
        await tokens.delete(tokenID)
        tokenEvents.emit("delete", tokenID);
    }, expiration_time)
}

/**
 * Creates a token only if user exists
 * @param {string} userID User uuid
 * @returns {Promise<Token|null>} Returns a promise resulting Token or null if failed
 */
tokens.create_with_check = async function (userID) {
    let token;
    let tries = 3;

    let promi = new Promise((resolve, reject) => {
        db.get(`SELECT id FROM diskdb.users WHERE id = ?`, [userID], function (err, row) {
            if (err) {
                reject(err)
            } else {
                if (typeof (row) === "undefined") {
                    reject(row);
                } else {
                    resolve(row);
                }
            }
        });
    }).catch((err) => { return undefined })

    let userExists = (await promi) ? true : false;

    if (!userExists) {
        return null
    }

    while (tries > 0) {
        token = new Token({ id: randomUUID(), userID: userID })
        let res = await insertOne("tokens", ["id", "created", "expires", "belongsTo"],
            [token.id, token.created, token.expires, token.belongsTo]
        );
        if (res) {
            onDeleteToken_helper(token.id);
            break;
        } else {
            tries -= 1;
        }
    }
    return (tries > 0) ? token : null
}


/**
 * Creates a token
 * @param {string} userID User uuid
 * @returns {Promise<Token|null>} Returns a promise with Token or null
 */
tokens.create = async function (userID) {
    let token;
    let tries = 3;

    while (tries > 0) {
        token = new Token({ id: randomUUID(), userID: userID });
        let res = await insertOne("tokens", ["id", "created", "expires", "belongsTo"],
            [token.id, token.created, token.expires, token.belongsTo]
        );
        if (res) {
            onDeleteToken_helper(token.id);
            break;
        } else {
            tries -= 1;
        }

    }
    return (tries > 0) ? token : null
}

/**
 * Gets token from DB
 * @param {string} tokenID Token ID
 * @returns {Promise<Token|null>} Returns token object
 */
tokens.get = async function (tokenID) {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM tokens where id = ?;", [tokenID], function (err, row) {
            if (err) {
                reject(err)
            } else {
                resolve(row)
            }
        })
    }).catch(err => { console.log(err); return null })
}

/**
 * Gets all tokens from DB
 * @returns {Promise<Token[]|null>} Returns a promise with a list of Tokens if resolved, or an Error if rejeted
 */
tokens.all = async function GetAllTokens() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM tokens`, function (error, rows) {
            if (error) {
                reject(error)
            } else {
                resolve(rows)
            }
        })
    }).catch(err => { console.log(err); return null })
}

tokens.delete = async function (tokenID) {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM tokens where id = ?;", [tokenID], function (error) {
            if (error) {
                reject(error)
            } else {
                resolve(this.changes)
            }
        })
    }).catch(err => { console.log(err); return null })
}


tokens.ofUser = async function GetUserTokens(userID) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT 
            tokens.id,
            tokens.created,
            tokens.expires,
            tokens.belongsTo 
            FROM tokens, diskdb.users 
            WHERE diskdb.users.id = ? AND diskdb.users.id = tokens.belongsTo;`, [userID], function (error, rows) {
            if (error) {
                reject(error)
            } else {
                resolve(rows)
            }
        })
    }).catch(err => { console.log(err); return null })
}

tokens.deleteUserTokens = async function DeleteUserTokens(userID) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM tokens WHERE belongsTo = ?`, [userID], function (error) {
            if (error) {
                reject(error);
            } else {
                resolve(this.changes)
            }
        })
    }).catch(err => { console.log(err); return null })
}

export {
    Token,
    tokens,
    tokenEvents
}