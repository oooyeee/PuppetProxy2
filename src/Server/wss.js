import path from "path"
import http from "http"
import fs from "fs"
import https from "https"
import { WebSocketServer, } from "ws"
import { app } from "./express.js"

import * as puptr from "../Puppeteer/factory.js"

let server = http.createServer(app);


let wsServer = new WebSocketServer({
    server: server,
    path: "/ws"
    // port: 8888
});

wsServer.on("connection", (ws) => {
    console.log(":: new client connection");
    // ws.send(">> Welcome, new client!s");

    let pup = null;

    ws.on("open", async function () {
        console.log("== WS on open ==");
        // if(pup.uuid && puptr.getInstanceUUIDs().includes(pup.uuid)){

        // }
        // pup = puptr.createInstance();
        // await pup.launchBrowser();

        // pup.on("screenshot", (buf) => {
        //     console.log("screenshotted");
        //     ws.send(buf);
        // })
        // pup.startScreenshotStream();
    });

    ws.on("message", async (data, isBinary) => {
        if (!isBinary) {
            try {
                console.log(Buffer.from(data).toString());
                let json = JSON.parse(data)
                if (json && json["type"]) {
                    if (json["type"] === "open browser") {
                        pup = puptr.createInstance();
                        await pup.launchBrowser();

                        pup.on("screenshot", (buf) => {
                            console.log("screenshotted");
                            ws.send(buf);
                        })
                        pup.startScreenshotStream({});
                        pup.goto("https://google.com");
                    } else if (json["json"]) {
                        pup.emit("interaction", json)
                    }
                }

            } catch (err) {
                console.log(err);

            }
        }
    });

    ws.on("error", (err) => {
        console.log("== VS Error ==");
        console.log(err);
    });


    ws.on("close", (code, reason) => {
        let reasonStr = Buffer.from(reason).toString("utf8")
        console.log(["== WS ON Close ==", code, reasonStr]);
        ws.close();
        if (pup && pup.stopScreenshotStream) {
            pup.stopScreenshotStream();
        }
        // await pup.close();
    });
});

export {
    server
}