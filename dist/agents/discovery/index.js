"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_promised_app_1 = require("../../express-promised-app");
const utils_1 = require("../../utils");
const registeredServices = {};
const registeredPorts = {};
let nextPort = 3500;
function assignPort(service) {
    const port = nextPort;
    if (registeredPorts[port]) {
        throw new Error(`internal error: port ${port} already has a service`);
    }
    nextPort += 1;
    service.port = port;
    registeredPorts[port] = service;
}
function setupEndpoints(app) {
    app.put('/service/:id', (req) => __awaiter(this, void 0, void 0, function* () {
        const { id } = req.params;
        const found = registeredServices[id];
        if (found) {
            return {
                statusCode: 400,
                error: "already have a service with id: " + id
            };
        }
        const service = req.body;
        if (!service.name) {
            return {
                statusCode: 400,
                error: "request data is missing: name"
            };
        }
        assignPort(service);
        registeredServices[id] = service;
        utils_1.print(`registered service ${id}: ${JSON.stringify(service)}`);
        return {
            service,
            message: 'okay, registered service with id: ' + id
        };
    }));
    app.delete('/service/:id', (req) => __awaiter(this, void 0, void 0, function* () {
        const { id } = req.params;
        const found = registeredServices[id];
        if (found) {
            delete registeredServices[id];
            utils_1.print(`deleted service ${id}`);
            return {
                message: 'okay, deleted service: ' + id
            };
        }
        else {
            return {
                statusCode: 404,
                error: "didn't find service: " + id
            };
        }
    }));
    app.get('/find', (req) => __awaiter(this, void 0, void 0, function* () {
        utils_1.print('called find');
        const query = req.query;
        const allServices = Object.values(registeredServices);
        const matches = allServices.filter(service => {
            if (query.name && service.name !== query.name)
                return false;
            if (query.tag && service.tags.indexOf(query.tag) === -1)
                return false;
            return true;
        });
        return {
            services: matches
        };
    }));
}
function startListening() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = express_promised_app_1.createExpressApp({
            setupEndpoints,
            printAccessLog: true
        });
        const port = process.env.PORT || 9141;
        yield app.listen(port);
        utils_1.print(`Web server listening at: 0.0.0.0:${port}`);
    });
}
if (require.main === module) {
    startListening()
        .catch(console.error);
}
//# sourceMappingURL=index.js.map