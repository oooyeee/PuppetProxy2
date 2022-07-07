
class InteractionHandler {
    /**
     * Dummy object
     * @param {{(interaction: Object, page: Object, browser: Object) => Promise}} fn Function handler
     */
    constructor(fn) {
        this.handle = fn
    }
}

/** @typedef {"goback"|"click"|"typing"} INTERACTION_TYPES */
const interactionHandlers = {
    goback: new InteractionHandler(async (json, page, browser) => {
        let event = await page.goBack();
    }),
    click: new InteractionHandler(async (json, page, browser) => {
        if (json.coords &&
            json.coords.x &&
            typeof (json.coords.x) === "number" &&
            json.coords.y &&
            typeof (json.coords.y) === "number") {
            let event = await page.mouse.click(json.coords.x, json.coords.y, {
                delay: 150
            });
        }

    }),
    typing: new InteractionHandler(async (json, page, browser) => {
        let event = await page.keyboard.type(json.text, { delay: 50 });
    }),

    "goto url": new InteractionHandler(async (json, page, browser) => {
        await page.goto(json.text)
    })
}


/**
 * Processes interaction
 * @param {{type: INTERACTION_TYPES, json: Object}} interactionJson Interaction object
 * @param {Object} page 
 * @param {Object} browser 
 */
async function ProcessInteraction(interactionJson, page, browser) {
    if (interactionJson && interactionJson.type && interactionJson.json) {
        let handler = interactionHandlers[interactionJson.type];
        if (handler) {
            await handler.handle(interactionJson.json, page, browser)
        }
    }
}


export {
    ProcessInteraction
}