
import configs from "../configs/index.js";

function logger(data, mandatory = false) {
    if (configs?.logger || mandatory) {
        console.log(`\n[time]: ${new Date()} \n${data}`);
    }
}

export default logger;