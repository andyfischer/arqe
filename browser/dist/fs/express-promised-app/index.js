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
/**
 * The main ExpressWrapper class. This wraps around a single `Express` app instance.
 * Using this class you can declare endpoints in Express-like style (using `app.get`, etc).
 */
class ExpressWrapper {
    constructor(params) {
        /**
         * Declare an endpoint with the given method.
         */
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
        /**
         * Declare an endpoint handler for the GET method.
         */
        this.get = (path, handler) => this.resource('get', path, handler);
        /**
         * Declare an endpoint handler for the POST method.
         */
        this.post = (path, handler) => this.resource('post', path, handler);
        /**
         * Declare an endpoint handler for the PUT method.
         */
        this.put = (path, handler) => this.resource('put', path, handler);
        /**
         * Declare an endpoint handler for the DELETE method.
         */
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
