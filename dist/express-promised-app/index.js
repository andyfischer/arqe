"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sendResponse_1 = __importDefault(require("./sendResponse"));
var express_1 = require("express");
exports.Request = express_1.Request;
var createExpressApp_1 = require("./createExpressApp");
exports.createExpressApp = createExpressApp_1.default;
function sendEndpointError(req, res, err) {
    console.error(err);
    const statusCode = err.statusCode || 500;
    const internalError = err.statusCode >= 500;
    res.setHeader('content-type', 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(statusCode);
    res.end(err.stack || err);
}
class ExpressWrapper {
    constructor(params) {
        this.resource = (method, path, handler) => {
            this.expressApp[method](path, async (req, res) => {
                try {
                    const response = await handler(req);
                    sendResponse_1.default(this, req, res, response);
                }
                catch (err) {
                    sendEndpointError(req, res, err);
                }
            });
        };
        this.get = (path, handler) => this.resource('get', path, handler);
        this.post = (path, handler) => this.resource('post', path, handler);
        this.put = (path, handler) => this.resource('put', path, handler);
        this.delete = (path, handler) => this.resource('delete', path, handler);
        if (!params.expressApp)
            throw new Error("missing: .expressApp");
        this.expressApp = params.expressApp;
    }
    listen(port) {
        const portNum = typeof port === 'string' ? parseInt(port, 10) : port;
        return new Promise((resolve, reject) => {
            const onReady = () => {
                resolve(httpServer);
            };
            const httpServer = this.expressApp.listen(port, '0.0.0.0', onReady);
        });
    }
}
exports.default = ExpressWrapper;
//# sourceMappingURL=index.js.map