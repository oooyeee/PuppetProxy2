import fs from "fs"
import path from "path"
import minimist from "minimist"
import swc from "@swc/core"
import { config } from "../config.js"

const known_cli_options = {
    string: ["path"],
    default: { path: null }
}

const cliFilePath = minimist(process.argv.slice(2), known_cli_options).path
const exists = fs.existsSync(cliFilePath) && fs.lstatSync(cliFilePath).isFile()

if (exists) {
    Transformer(cliFilePath)
}

function Transformer(filepath) {
    let source = Buffer.from(fs.readFileSync(filepath)).toString("utf8")
    swc.transform(source, {
        sourceMaps: false,
        filename: filepath,
        configFile: config.__swcrc,
        swcrc: true
    }).then(output => {
        // console.log(output.code)
        // console.log(output.map)
        let basedir = path.dirname(filepath)
        let filename = path.basename(filepath, path.extname(filepath)) + ".js"
        let newFilePath = path.join(basedir, filename)
        fs.writeFileSync(newFilePath, output.code, { flag: "w+", encoding: "utf8" })

    }).catch(err => {
        console.log("== Error tranforming with SWC ==");
        // console.log(err);
        console.log(err.message ?? "error");
    })
}


export {
    Transformer
}