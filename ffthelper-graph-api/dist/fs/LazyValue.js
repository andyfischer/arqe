"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UpdateContext_1 = __importDefault(require("./UpdateContext"));
class LazyValue {
    constructor(graph, updateFn) {
        this.hasValue = false;
        this.watchedQueries = [];
        this.graph = graph;
        this.updateFn = updateFn;
    }
    runUpdate() {
        const context = new UpdateContext_1.default(this.graph);
        this.value = this.updateFn(context);
        this.hasValue = true;
        this.watchedQueries = context.watchesForUsedSearches();
    }
    get() {
        if (!this.hasValue) {
            this.runUpdate();
            return this.value;
        }
        let changed = false;
        for (const query of this.watchedQueries) {
            changed = changed || query.checkChange();
        }
        if (changed) {
            this.runUpdate();
        }
        return this.value;
    }
}
exports.default = LazyValue;
