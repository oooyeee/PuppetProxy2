import path from "path"
import glob from "glob"
import { config } from "../config.js"
import { Transformer } from "./swcbuild.js"

const log = console.log

let globs = path.join(config.__srcdir, "/**/*.ts").split("\\").join("/")

glob(globs, function (err, files) {
    if (err) {
        log(err)
    } else {
        for (let file of files) {
            Transformer(file)
        }
    }
})