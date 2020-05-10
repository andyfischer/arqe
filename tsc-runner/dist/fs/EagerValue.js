"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UpdateContext_1 = __importDefault(require("./UpdateContext"));
class EagerValue {
    constructor(graph, updateFn, initialValue) {
        this.id = graph.nextEagerValueId;
        this.value = initialValue;
        graph.nextEagerValueId += 1;
        this.graph = graph;
        this.updateFn = updateFn;
    }
    runUpdate() {
        const context = new UpdateContext_1.default(this.graph);
        this.value = this.updateFn(context);
        for (const savedQuery of context.savedQueriesForUsedSearches()) {
            savedQuery.connectEagerValue(this);
        }
    }
    get() {
        return this.value;
    }
}
exports.default = EagerValue;
//# sourceMappingURL=EagerValue.js.map