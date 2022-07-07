import path from "path"
import express from "express"
import { createServer } from "vite"

import { config } from "../../config.js";

import { validateLogin, validateRegister } from "./helpers.js"

const app = express();

app.post("/auth", (req, res) => {
    let body = [];

    req.on("data", (chunk) => {
        body.push(chunk);
    })

    req.on("end", async () => {
        let jsonString = "";
        let debuff = Buffer.concat(body).toString("utf8");
        console.log(["== debuff ==", debuff]);
        try {
            let json = JSON.parse(debuff);
            console.log("== Got valid JSON ==");
            console.log(json)

            let login = req.query["login"] !== undefined;
            let register = req.query["register"] !== undefined;

            let response, statusCode;
            if (login) {
                [statusCode, response] = await validateLogin(json)
                res.statusCode = statusCode;
                jsonString = response;
            } else if (register) {
                [statusCode, response] = await validateRegister(json);
                res.statusCode = statusCode;
                jsonString = response;
            } else {
                res.statusCode = 400;
                jsonString = `{"error":"invalid query parameter"}`;
            }


        } catch (err) {
            console.log("== /auth body parser error ==");
            console.log(err);
            res.statusCode = 500
            jsonString = `{"error":"failed processing response"}`
        }
        console.log(jsonString);



        res.setHeader("Content-Type", "application/json");
        res.write(jsonString)
        res.end();
    });

});

//@TODO delete this later (dummy nginx headers)
app.use((req, res, next) => {
    let hithere = req.headers["hithere"] ?? "no hi there"
    let host = req.headers["host"] ?? "no host :("
    console.log(["hi there", hithere, "host ?", host]);
    next();
});


if (config.isProd) {
    app.use(express.static(config.__distdir));
} else {
    console.log("=== Vite Dev Server ===");
    let viteServer = await createServer({
        server: {
            middlewareMode: "html"
        }
    });
    app.use(viteServer.middlewares)
}

export {
    app
}