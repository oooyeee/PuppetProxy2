import { EventEmitter } from "events"
import { randomUUID } from "crypto"
import { db, insertOne } from "./db.js"
import { makeHash } from "../utils.js"

class User {
    constructor({ name, password, id }) {
        this.id = id;
        this.name = name;
        this.password = makeHash(password);
    }
}

// on disk Sqlite table
let users = {};

let userEvents = new EventEmitter();

function onDeleteUser_helper(userID) {
    setTimeout(async () => {
        userEvents.emit("delete", userID);
    }, expiration_time)
}

/**
 * Creates new user
 * @param {string} name New username
 * @param {string} password Password
 * @returns {Promise<User|null>} Returns a promise resulting with new User or null if error
 */
users.create = async function (name, password) {
    let tries = 3;
    let user;
    // loop 3 times to make sure random uuid does not collide with already stored
    while (tries > 0) {
        user = new User({ name: name, password: password, id: randomUUID() })
        let res = await insertOne("diskdb.users", ["id", "name", "password"], [user.id, user.name, user.password]);
        if (res) {
            break;
        } else {
            tries -= 1;
        }
    }
    return (tries > 0) ? user : null
}


/**
* Gets user object from DB
* @param {string} userID User UUID
* @returns {Promise<User|null>} Returns a promise resolving with User (undefined if not found) or rejecting with Error
*/
users.get = async function (userID) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT id, name, password FROM diskdb.users WHERE id = ? LIMIT 1;`, [userID], function (err, row) {
            if (err) {
                reject(err)
            } else {
                resolve(row)
            }
        })
    }).catch(err => { console.log(err); return null })
}

users.delete = async function (userID) {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM diskdb.users where id = ?;", [userID], function (error) {
            if (error) {
                reject(error)
            } else {
                onDeleteUser_helper(userID);
                resolve(this.changes)
            }
        })
    }).catch(err => { console.log(err); return null })
}

/**
* Updates user
* @param {User} user User object
* @returns {Proimse<number|null>} Returns number of changes or null if error
*/
users.update = async function (user) {
    return new Promise((resolve, reject) => {
        db.run("UPDATE diskdb.users SET name = ?, password = ? WHERE id = ?;", [user.name, user.password, user.id], function (error) {
            if (error) {
                reject(error)
            } else {
                resolve(this.changes)
            }
        })
    }).catch(err => { console.log(err); return null })
}


export {
    User,
    users,
    userEvents
}