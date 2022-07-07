import path from "path"
import fs from "fs"
import { env, config } from "../../config.js"
import sqlite3 from "sqlite3"

// const sqlite = config.isProd ? sqlite3 : sqlite3.verbose();
const sqlite = sqlite3.verbose();

const { __datadir } = config;

const dbpath = path.join(__datadir, "mydb.sqlite");
// ATTACH database is not supported in sqlite3 ???
const db = new sqlite.Database(":memory:");


/**
 * Runs insert multiple values query
 * @param {sqlite3.Database} db Database
 * @param {string} tableName Table name
 * @param {string[]} columns Column names
 * @param {Array<any[]>} values Array of same-length arrays with values (strings or numbers)
 * @returns {Promise<any|Error>} Returns a promise with last inserted row id or null if error
 */
async function insertMultiple(tableName, columns, values) {
    let q = `INSERT INTO ${tableName} (${columns.map(col => `"${col}"`).join(",")}) VALUES `;
    let vals = values.flat();
    let length = vals.length / values.length;
    if (!Number.isInteger(length)) {
        return;
    }
    let cols = "?";
    for (let i = 1; i < length; i++) {
        cols += ",?"
    }

    q += values.map(() => `(${cols})`).join(",");
    q += ";"

    return new Promise((resolve, reject) => {
        db.run(q, vals, function (error) {
            if (error) {
                reject(error)
            } else {
                resolve(this.lastID)
            }
        });
    }).catch((err) => { console.log(err); return null });
}

/**
 * Inserts 1 row into table
 * @param {string} tableName Table name
 * @param {string[]} columns Column names
 * @param {string[]} values Values array
 * @returns {Promise<string|null>} Returns a promise with last inserted row id or null if error
 */
async function insertOne(tableName, columns, values) {
    let q = `INSERT INTO ${tableName} (${columns.map(col => `"${col}"`).join(",")}) 
        VALUES (${values.map(() => `?`).join(",")})`;


    return new Promise((resolve, reject) => {
        db.run(q, values, function (error) {
            if (error) {
                reject(error)
            } else {
                resolve(this.lastID)
            }
        });
    }).catch((err) => { console.log(err); return null });
}

function InitDB(shouldCleanUsers = false) {
    db.serialize(() => {
        db.run("PRAGMA foreign_keys = ON;");
        db.run(`ATTACH DATABASE "${dbpath}" as diskdb;`);
        db.run("DROP TABLE IF EXISTS tokens;");
        if (shouldCleanUsers) {
            db.run("DROP TABLE IF EXISTS diskdb.users;");
            db.run(`CREATE TABLE diskdb.users (
                id TEXT PRIMARY KEY NOT NULL,
                name TEXT NOT NULL, 
                password TEXT NOT NULL);`);
        }

        db.run(`CREATE TABLE tokens (
            id TEXT PRIMARY KEY NOT NULL,
            created INTEGER NOT NULL,
            expires INTEGER NOT NULL,
            belongsTo TEXT NOT NULL);`);
        //  FOREIGN KEY (belongsTo) REFERENCES diskdb.users (id) ON DELETE CASCADE);
        // sqlite cannot trigger built-in cascade action when referencing attached db
        // for create logic check see in ./models.js -> tokens.create()...

        // creating trigger, because ON DELETE CASCADE doesnt work, see above
        db.run(`CREATE TEMPORARY TRIGGER IF NOT EXISTS on_delete_user_clear_tokens
            AFTER DELETE ON diskdb.users
            BEGIN
                DELETE FROM tokens
                WHERE tokens.belongsTo = OLD.id;
            END;`);
    });
}



export {
    db,
    InitDB,
    insertOne,
    insertMultiple
}