import path from "path"
import fs from "fs"
import { EventEmitter } from "events"
import puppeteer from 'puppeteer'
import process from "process"

import { ProcessInteraction } from "./puppeteer_interactions.js"

// import ws from "ws"
const urls = {
    "yaro.pt": "https://yaro.pt",
    "rutracker": "https://rutracker.org"
}

const sizes = {
    width: 980,
    height: 600
}

class PuppeteerInstance extends EventEmitter {
    constructor(uuid) {
        super();
        this.uuid = uuid;
        this.browser = null;
        this.page = null;
        this.interval = null;

        this.on("interaction", async (interactionJson) => {
            await ProcessInteraction(interactionJson, this.page, this.browser);
        });
    }

    async launchBrowser() {
        this.browser = await puppeteer.launch({
            headless: true,
            args: [
                `--window-size=${sizes.width},${sizes.height}`
            ],
            defaultViewport: {
                width: sizes.width,
                height: sizes.height
            },
            handleSIGINT: false
        });

        this.page = await this.browser.newPage();
    }

    async goto(url) {
        return this.page.goto(url, {
            waitUntil: "networkidle0"
        })
    }

    /**
     * Starts "stream" from browser
     * @param {{interval_ms: number, type: "webp"|"png"|"jpeg", quality: number}} options Options for screenshots 
     */
    startScreenshotStream({ interval_ms = 1000, type = "webp", quality = 50 }) {
        console.log(["screenshot stream options", interval_ms, type, quality]);
        this.interval = setInterval(async () => {
            let buf = await this.page.screenshot({ type: type, quality: quality, encoding: "base64" });
            this.emit("screenshot", buf);
        }, interval_ms);
    }

    stopScreenshotStream() {
        clearInterval(this.interval);
    }

    async close() {
        return this.browser.close();
    }
}

export {
    PuppeteerInstance
}