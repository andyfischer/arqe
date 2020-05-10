"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UpdateContext_1 = __importDefault(require("./UpdateContext"));
const SavedQueryWatch_1 = __importDefault(require("./SavedQueryWatch"));
class CachedValue {
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
        this.watchedQueries = [];
        for (const sawSearch of context.sawSearches) {
            this.watchedQueries.push(new SavedQueryWatch_1.default(this.graph.newSavedQuery('get ' + sawSearch)));
        }
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
exports.default = CachedValue;
//# sourceMappingURL=CachedValue.js.map