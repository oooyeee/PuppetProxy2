import favicons from "favicons"
import fs from "fs"
import path from "path"

import { config } from "../config.js"

const { __iconsdir, __distdir, __publicdir, isDev } = config

const source = path.join(__iconsdir, "/Ylogo.png"); // Source image(s). `string`, `buffer` or array of `string`

let configuration = {
    path: "/", // Path for overriding default icons path. `string`
    appName: null, // Your application's name. `string`
    appShortName: null, // Your application's short_name. `string`. Optional. If not set, appName will be used
    appDescription: null, // Your application's description. `string`
    developerName: null, // Your (or your developer's) name. `string`
    developerURL: null, // Your (or your developer's) URL. `string`
    dir: "auto", // Primary text direction for name, short_name, and description
    lang: "en-US", // Primary language for name and short_name
    background: "#fff", // Background colour for flattened icons. `string`
    theme_color: "#fff", // Theme color user for example in Android's task switcher. `string`
    appleStatusBarStyle: "black-translucent", // Style for Apple status bar: "black-translucent", "default", "black". `string`
    display: "standalone", // Preferred display mode: "fullscreen", "standalone", "minimal-ui" or "browser". `string`
    orientation: "any", // Default orientation: "any", "natural", "portrait" or "landscape". `string`
    scope: "/", // set of URLs that the browser considers within your app
    start_url: "/?homescreen=1", // Start URL when launching the application from a device. `string`
    version: "1.0", // Your application's version string. `string`
    logging: false, // Print logs to console? `boolean`
    pixel_art: false, // Keeps pixels "sharp" when scaling up, for pixel art.  Only supported in offline mode.
    loadManifestWithCredentials: false, // Browsers don't send cookies when fetching a manifest, enable this to fix that. `boolean`
    icons: {
        // Platform Options:
        // - offset - offset in percentage
        // - background:
        //   * false - use default
        //   * true - force use default, e.g. set background for Android icons
        //   * color - set background for the specified icons
        //   * mask - apply mask in order to create circle icon (applied by default for firefox). `boolean`
        //   * overlayGlow - apply glow effect after mask has been applied (applied by default for firefox). `boolean`
        //   * overlayShadow - apply drop shadow after mask has been applied .`boolean`
        //
        android: false, // Create Android homescreen icon. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
        appleIcon: false, // Create Apple touch icons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
        appleStartup: false, // Create Apple startup images. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
        coast: false, // Create Opera Coast icon. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
        favicons: true, // Create regular favicons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
        firefox: false, // Create Firefox OS icons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
        windows: false, // Create Windows 8 tile icons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
        yandex: false, // Create Yandex browser icon. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
    }
}

let callback = function (error, response) {
    if (error) {
        console.log(error.message); // Error description e.g. "An unknown error has occurred"
        return;
    }
    let iconsFolder = isDev ? __publicdir : __distdir;
    let iconNames = [
        "favicon-48x48.png",
        "favicon.ico"
    ]
    let count = 0;
    for (let image of response.images) {
        if (iconNames.includes(image.name) && count < 4) {
            if (!fs.existsSync(iconsFolder)) {
                fs.mkdirSync(iconsFolder, { recursive: true })
            }
            fs.writeFileSync(path.join(iconsFolder, image.name), image.contents, { flag: "w+" })
        }
    }

    console.log("== favicon.ico is done ==")
};

favicons(source, configuration, callback);