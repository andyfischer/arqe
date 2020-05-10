"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parseCommand_1 = __importDefault(require("./parseCommand"));
class SavedQueryCache {
    constructor(graph, tags, recompute) {
        this.stale = true;
        this.graph = graph;
        this.recompute = recompute;
        this.getCommand = parseCommand_1.default('get ' + tags);
    }
    _update() {
        // const rels = this.graph
    }
    get() {
        if (this.stale) {
            this.result = this._update();
            this.stale = false;
        }
        return this.result;
    }
    onRelationUpdated(rel) {
    }
    onRelationDeleted(rel) {
    }
}
exports.default = SavedQueryCache;
