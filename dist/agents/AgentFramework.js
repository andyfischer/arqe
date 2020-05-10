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
const express_promised_app_1 = require("../express-promised-app");
const bent_1 = __importDefault(require("bent"));
const __1 = require("..");
const discoveryServiceUrl = 'http://localhost:9141/';
class AgentFramework {
    constructor(args) {
        this.setupArgs = args;
        this.serviceId = `${args.name}-${__1.randomHex(6)}`;
        this.webApp = express_promised_app_1.createExpressApp({
            setupEndpoints: app => this.setupEndpoints(app)
        });
    }
    setupEndpoints(app) {
    }
    implementCommand() {
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            let registeredService;
            try {
                const put = bent_1.default(discoveryServiceUrl, 'json', 'PUT', 200);
                registeredService = yield put(`service/${this.serviceId}`, {
                    name: this.setupArgs.name,
                    tags: ['agent']
                });
            }
            catch (err) {
                const msg = 'error: Failed to connect to discovery service at ' + discoveryServiceUrl;
                __1.print(msg);
                if (err.responseBody) {
                    __1.print(yield err.responseBody);
                }
                throw new Error(msg);
            }
            const port = registeredService.service.port;
            if (!port) {
                const msg = "error: discovery service didn't give us a port";
                __1.print(msg);
                throw new Error(msg);
            }
            process.on('beforeExit', code => {
                this.stop();
            });
            this.httpServer = yield this.webApp.listen(port);
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const del = bent_1.default(discoveryServiceUrl, 'json', 'DELETE', 200);
                yield del(`service/${this.serviceId}`);
            }
            catch (err) {
            }
            this.httpServer.close();
        });
    }
}
exports.default = AgentFramework;
//# sourceMappingURL=AgentFramework.js.map