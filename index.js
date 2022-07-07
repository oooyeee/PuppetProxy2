import { config, env } from "./config.js"
import { InitDB } from "./src/DB/db.js";
import { server } from "./src/Server/wss.js"

InitDB(true);

server.listen(config.port, "0.0.0.0", () => {
    console.log(`== Server listening on port: ${config.port}`);
})
