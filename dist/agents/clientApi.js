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
const bent_1 = __importDefault(require("bent"));
function getAgents(snapshot) {
    return __awaiter(this, void 0, void 0, function* () {
        const discoveryServiceUrl = snapshot.getValue('discovery-service-url');
        const get = bent_1.default(discoveryServiceUrl, 'GET', 'json', 200);
        const resp = yield get('find?tag=agent');
        return resp.services || [];
    });
}
exports.getAgents = getAgents;
function getServices(snapshot) {
    return __awaiter(this, void 0, void 0, function* () {
        const discoveryServiceUrl = snapshot.getValue('discovery-service-url');
        const get = bent_1.default(discoveryServiceUrl, 'GET', 'json', 200);
        const resp = yield get('find');
        return resp.services || [];
    });
}
exports.getServices = getServices;
//# sourceMappingURL=clientApi.js.map