"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parseCommand_1 = __importDefault(require("./parseCommand"));
const GetOperation_1 = __importDefault(require("./GetOperation"));
const SavedQueryWatch_1 = __importDefault(require("./SavedQueryWatch"));
class UpdateContext {
    constructor(graph) {
        this.usedSearches = [];
        this.graph = graph;
    }
    getRelations(tags) {
        if (tags.startsWith('get '))
            throw new Error("getRelations(tags) should not include 'get': " + tags);
        const commandStr = 'get ' + tags;
        this.usedSearches.push(tags);
        const parsedCommand = parseCommand_1.default(commandStr);
        const get = new GetOperation_1.default(this.graph, parsedCommand);
        let rels = null;
        get.outputToRelationList(l => { rels = l; });
        get.run();
        if (rels === null)
            throw new Error("get didn't finish synchronously: " + commandStr);
        return rels;
    }
    getOptionsObject(tags) {
        const out = {};
        for (const option of this.getRelations(`${tags} option/*`)) {
            out[option.getTagValue("option")] = option.payload();
        }
        return out;
    }
    savedQueriesForUsedSearches() {
        return this.usedSearches.map(sawSearch => this.graph.savedQuery(sawSearch));
    }
    watchesForUsedSearches() {
        return this.savedQueriesForUsedSearches().map(savedQuery => new SavedQueryWatch_1.default(savedQuery));
    }
}
exports.default = UpdateContext;
