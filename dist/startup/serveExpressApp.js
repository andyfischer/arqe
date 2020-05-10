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
const express_1 = __importDefault(require("express"));
const express_promised_app_1 = __importDefault(require("../express-promised-app"));
const setupEndpoints_1 = __importDefault(require("../web/setupEndpoints"));
const utils_1 = require("../utils");
function setupExpressApp() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = express_1.default();
        app.use(require('body-parser').json());
        app.options('/*', (req, res) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            res.header('Access-Control-Max-Age', '86400');
            res.sendStatus(200);
        });
        const layer = new express_promised_app_1.default({
            expressApp: app
        });
        setupEndpoints_1.default(layer);
        app.use((req, res, next) => {
            res.status(404);
            res.setHeader('Content-Type', 'text/plain');
            res.end('Not found: ' + req.url);
        });
        const port = process.env.PORT || 9140;
        yield layer.listen(port);
        utils_1.print(`Web server started, listening on: 0.0.0.0:${port}`);
    });
}
exports.default = setupExpressApp;
//# sourceMappingURL=serveExpressApp.js.map