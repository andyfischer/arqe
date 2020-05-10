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
        /*
        const subSearch: RelationSearch = {
            pattern: search.pattern.removeType(this.mountTypename),
            subSearchDepth: search.subSearchDepth + 1,
            start() {},
            relation: (rel: Relation) => {
                
                const cxt = new UpdateContext(this.graph);
                const derivedValue = this.callback(cxt, rel);

                const foundPattern = rel.copy();
                foundPattern.addTag(this.mountTypename);
                foundPattern.setValue(derivedValue);
                search.relation(foundPattern);

            },
            finish() {
                search.finish();
            },
            isDone() {
                return search.isDone()
            }
        }
        
        runSearch(this.graph, subSearch);
        */
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
