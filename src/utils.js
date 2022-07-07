import { createHash } from "crypto"

export const sse_headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive'
}

export function createSSEmessage(eventName, interval, id, data) {
    return `event: ${eventName}\nretry: ${interval}\nid: ${id}\ndata: ${data}\n\n`
}

export function makeHash(str) {
    return createHash("sha256").update(str).digest("base64")
}
