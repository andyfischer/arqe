"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UpdateContext_1 = __importDefault(require("./UpdateContext"));
const runSearch_1 = __importDefault(require("./runSearch"));
const parseCommand_1 = require("./parseCommand");
class DerivedValueMount {
    constructor(graph, callback, mountTypename) {
        this.graph = graph;
        this.mountTypename = mountTypename;
        this.callback = callback;
    }
    runSearch(search) {
        const subSearch = {
            graph: search.graph,
            pattern: search.pattern.removeType(this.mountTypename),
            subSearchDepth: search.subSearchDepth + 1,
            relation: (rel) => {
                const cxt = new UpdateContext_1.default(this.graph);
                const derivedValue = this.callback(cxt, rel);
                const foundPattern = rel
                    .addTagStr(this.mountTypename)
                    .addTagStr('value/' + derivedValue);
                search.relation(foundPattern);
            },
            finish() {
                search.finish();
            },
        };
        runSearch_1.default(subSearch);
    }
    async runSave(rel, output) {
        throw new Error("can't save on a derived value");
    }
}
exports.default = DerivedValueMount;
function mountDerivedTag(graph, patternStr, keyTag, callback) {
    const pattern = parseCommand_1.parsePattern(patternStr);
    graph.derivedValueMounts.push({
        pattern,
        storage: new DerivedValueMount(graph, callback, keyTag)
    });
}
exports.mountDerivedTag = mountDerivedTag;
//# sourceMappingURL=DerivedValueMount_V1.js.map