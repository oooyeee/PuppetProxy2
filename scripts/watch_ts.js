import fs from "fs"
import path from "path"
import chokidar from "chokidar"
import { config } from "../config.js"
import { Transformer } from "./swcbuild.js"

const log = console.log

let globs = path.join(config.__srcdir, "/**/*.ts").split("\\").join("/")

const watcher = chokidar.watch(globs, {
    ignoreInitial: true,
    atomic: 200
})

watcher.on('add', (filePath) => {
    log(`TS File ${filePath} has been added`)
    BackupOnAdd(filePath)
}).on('change', (filePath) => {
    log(`TS File ${filePath} has been changed`)
    Transformer(filePath)
}).on('unlink', (filePath) => {
    log(`TS File ${filePath} has been removed`)
    let basedir = path.dirname(filePath)
    let filename = path.basename(filePath, path.extname(filePath)) + ".js"
    let newFilePath = path.join(basedir, filename)
    if (fs.existsSync(newFilePath) && fs.lstatSync(newFilePath).isFile()) {
        fs.unlinkSync(newFilePath)
    }
    log(`JS File ${newFilePath} has been removed`)
});

function BackupOnAdd(filePath) {
    let basedir = path.dirname(filePath)
    let jsfilename = path.basename(filePath, path.extname(filePath)) + ".js"
    let jsFileToBk = path.join(basedir, jsfilename)
    if (fs.existsSync(jsFileToBk) && fs.lstatSync(jsFileToBk).isFile()) {
        for (let i = 1; ; i++) {
            let apendName = `__bk[${i}]__.js`
            let filename = path.basename(filePath, path.extname(filePath)) + apendName
            let new_bk_filename = path.join(basedir, filename)
            if (!fs.existsSync(new_bk_filename)) {
                fs.copyFileSync(jsFileToBk, new_bk_filename);
                break;
            }
        }
    }
}