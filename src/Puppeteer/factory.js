import { randomUUID } from "crypto"
import { PuppeteerInstance } from "./puppeteer_instance.js"

let instances = {};

function createInstance() {
    let instance;
    while (true) {
        let uuid = "pup_inst_" + randomUUID();
        if (!instances[uuid]) {
            instance = new PuppeteerInstance(uuid);
            instances[uuid] = instance;
            break;
        }
    }
    return instance;
}

async function removeInstance(uuid) {
    if (instances[uuid]) {
        await instances[uuid].close();
        delete instances[uuid];
        return true
    } else {
        return null
    }
}

async function removeAllInstances() {
    let count = 0;
    for (let uuid in instances) {
        await instances[uuid].close();
        delete instances[uuid];
        count += 1;
    }
    return count;
}

function getAllInstances() {
    return instances;
}

function getInstanceUUIDs() {
    let instances_uuids = [];
    for (let uuid in instances) {
        instances_uuids.push(uuid);
    }
    return instances_uuids;
}

export {
    createInstance,
    removeInstance,
    removeAllInstances,
    getAllInstances,
    getInstanceUUIDs
}