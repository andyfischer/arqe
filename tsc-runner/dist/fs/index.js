"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_promised_app_1 = require("./express-promised-app");
exports.createExpressApp = express_promised_app_1.createExpressApp;
var utils_1 = require("./utils");
exports.print = utils_1.print;
exports.printError = utils_1.printError;
exports.randomHex = utils_1.randomHex;
var storage_1 = require("./storage");
exports.appendToLog = storage_1.appendToLog;
if (require.main === module) {
    require('./startup/main');
}
//# sourceMappingURL=index.js.map