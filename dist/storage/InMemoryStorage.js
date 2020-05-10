"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CommandMeta_1 = require("../CommandMeta");
class InMemoryStorage {
    constructor(graph) {
        this.relationsByNtag = {};
        this.nextUniqueIdPerType = {};
        this.graph = graph;
    }
    *linearScan(pattern) {
        for (const ntag in this.relationsByNtag) {
            const rel = this.relationsByNtag[ntag];
            if (pattern.matches(rel)) {
                yield rel;
            }
        }
    }
    *findAllMatches(pattern) {
        for (const rel of this.linearScan(pattern)) {
            yield rel;
        }
    }
    runSearch(search) {
        for (const rel of this.findAllMatches(search.pattern)) {
            search.relation(rel);
        }
        search.finish();
    }
    runSave(relation, output) {
        const ntag = relation.getNtag();
        const existing = this.relationsByNtag[ntag];
        for (const tag of relation.tags) {
            if (tag.valueExpr) {
                CommandMeta_1.emitCommandError(output, "InMemoryStorage unhandled expression: " + tag.stringify());
                output.finish();
                return;
            }
        }
        if (existing) {
            let modified = existing.setPayload(relation.getPayload());
            this.relationsByNtag[ntag] = modified;
            output.relation(modified);
            output.finish();
            this.graph.onRelationUpdatedV3(relation);
            return;
        }
        this.relationsByNtag[ntag] = relation;
        output.relation(this.relationsByNtag[ntag]);
        output.finish();
        this.graph.onRelationCreated(relation);
    }
    deleteRelation(rel) {
        delete this.relationsByNtag[rel.getNtag()];
    }
}
exports.default = InMemoryStorage;
//# sourceMappingURL=InMemoryStorage.js.map