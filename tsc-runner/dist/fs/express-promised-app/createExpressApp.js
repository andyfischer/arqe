"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const _1 = __importDefault(require("."));
const utils_1 = require("../utils");
function createExpressApp(opts) {
    const app = express_1.default();
    if (opts && opts.printAccessLog) {
        app.use((req, res, next) => {
            res.on('finish', () => {
                utils_1.print(`${req.method} ${req.url} ${res.statusCode}`);
            });
            next();
        });
    }
    app.use(body_parser_1.default.json());
    app.options('/*', (req, res) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Max-Age', '86400');
        res.sendStatus(200);
    });
    const layer = new _1.default({
        expressApp: app
    });
    opts.setupEndpoints(layer);
    app.use((req, res, next) => {
        res.status(404);
        res.setHeader('Content-Type', 'text/plain');
        res.end('Not found: ' + req.url);
    });
    return layer;
}
exports.default = createExpressApp;
//# sourceMappingURL=createExpressApp.js.map