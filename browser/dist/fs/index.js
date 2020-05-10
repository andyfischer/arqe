"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_promised_app_1 = require("./express-promised-app");
exports.createExpressApp = express_promised_app_1.createExpressApp;
var utils_1 = require("./utils");
exports.print = utils_1.print;
exports.printError = utils_1.printError;
exports.randomHex = utils_1.randomHex;
// export { loadMainSnapshot, Snapshot } from './framework'
// export { AgentFramework } from './agents'
// export { parseQueryInput } from './parse-query'
// export { Query, runQueryInput } from './query'
var storage_1 = require("./storage");
exports.appendToLog = storage_1.appendToLog;
// export { error, performedAction, done } from './rich-value'
if (require.main === module) {
    require('./startup/main');
}
