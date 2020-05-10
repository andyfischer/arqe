"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UpdateContext_1 = __importDefault(require("./UpdateContext"));
const parseCommand_1 = require("./parseCommand");
class DerivedValueMount {
    constructor(graph, callback) {
        this.graph = graph;
        this.callback = callback;
    }
    runSearch(search) {
        const cxt = new UpdateContext_1.default(this.graph);
        this.callback(cxt, search);
    }
    async runSave(set) {
        throw new Error("can't save on a derived value");
    }
}
exports.default = DerivedValueMount;
function mountDerivedTag(graph, patternStr, callback) {
    const pattern = parseCommand_1.parsePattern(patternStr);
    graph.derivedValueMounts.push({
        pattern,
        storage: new DerivedValueMount(graph, callback)
    });
}
exports.mountDerivedTag = mountDerivedTag;
//# sourceMappingURL=DerivedValueMount.js.map