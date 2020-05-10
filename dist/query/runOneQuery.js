"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const printResponseToTerminal_1 = __importDefault(require("../framework/printResponseToTerminal"));
const framework_1 = require("../framework");
const utils_1 = require("../utils");
const runQueryInput_1 = __importDefault(require("./runQueryInput"));
function queryRespond(query, result) {
    let hasResponded = false;
    const startTime = Date.now();
    let promiseResolve = null;
    query.promise = new Promise((resolve, reject) => {
        promiseResolve = resolve;
    });
    return (data) => {
        const elapsed = Date.now() - startTime;
        if (hasResponded) {
            utils_1.print('warning: double response for query: ' + query.syntax.originalStr);
            return;
        }
        if (elapsed > 500)
            utils_1.print('warning: slow response for query: ' + query.syntax.originalStr);
        if (query.isInteractive)
            printResponseToTerminal_1.default(query, data);
        result.frame = data;
        hasResponded = true;
        promiseResolve();
    };
}
function runOneQuery(snapshot, query) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = { frame: {} };
        query.respond = queryRespond(query, result);
        query.subQuery = (str) => runQueryInput_1.default(snapshot, str, { isInteractive: false });
        for (const watcher of snapshot.queryWatchers)
            watcher(query);
        if (query.command) {
            framework_1.runCommand(query);
        }
        return result;
    });
}
exports.default = runOneQuery;
//# sourceMappingURL=runOneQuery.js.map