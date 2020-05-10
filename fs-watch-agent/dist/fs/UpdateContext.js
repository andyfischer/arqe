"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parseCommand_1 = __importDefault(require("./parseCommand"));
const SavedQueryWatch_1 = __importDefault(require("./SavedQueryWatch"));
const runSearch_1 = __importDefault(require("./runSearch"));
const runCommand_1 = require("./runCommand");
class UpdateContext {
    constructor(graph) {
        this.usedSearches = [];
        this.graph = graph;
    }
    get(tags) {
        if (tags.startsWith('get '))
            throw new Error("getRelations(tags) should not include 'get': " + tags);
        const commandStr = 'get ' + tags;
        this.usedSearches.push(tags);
        const parsedCommand = parseCommand_1.default(commandStr);
        const commandExec = runCommand_1.singleCommandExecution(this.graph, parsedCommand);
        commandExec.output.waitForAll(l => { rels = l; });
        let rels = null;
        const search = commandExec.toRelationSearch();
        runSearch_1.default(this.graph, search);
        if (rels === null)
            throw new Error("get didn't finish synchronously: " + commandStr);
        return rels;
    }
    getOne(tags) {
        const rels = this.get(tags);
        if (rels.length === 0)
            throw new Error(`relation not found: ${tags}`);
        if (rels.length > 1)
            throw new Error(`expected one relation for: ${tags}`);
        return rels[0];
    }
    getRelations(tags) {
        return this.get(tags);
    }
    getOptionsObject(tags) {
        const out = {};
        for (const option of this.getRelations(`${tags} option/*`)) {
            out[option.getTagValue("option")] = option.getPayload();
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
function runUpdateOnce(graph, fn) {
    const cxt = new UpdateContext(graph);
    return fn(cxt);
}
exports.runUpdateOnce = runUpdateOnce;
//# sourceMappingURL=UpdateContext.js.map