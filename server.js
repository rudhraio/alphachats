import * as http from "http";
import serverless from "serverless-http";


import { app } from "./src/app.js";
import configs from "./src/utils/configs/index.js";
import logger from "./src/utils/helpers/logger.js";

function main() {
    const server = http.createServer(app);
    const PORT = configs.port || 3200;
    try {
        server.listen(PORT, () => {
            logger(`Server is listening on port ${PORT}`, true);
            logger(`Access it from http://localhost:${PORT}`, true);
        });
    } catch (err) {
        logger(`Server is Failed to load \n[ERR]: ${err}`, true);
    }
}

if (configs.env === "dev") {
    main();
}

const handler = serverless(app);
export { handler };