"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Graph_1 = __importDefault(require("./Graph"));
const Scope_1 = __importDefault(require("./Scope"));
function scopeFromObject(object) {
    const graph = new Graph_1.default();
    const scope = new Scope_1.default(graph);
    for (const key in object) {
        scope.createSlot(key);
        scope.set(key, object[key]);
    }
    return scope;
}
exports.default = scopeFromObject;
//# sourceMappingURL=scopeFromObject.js.map