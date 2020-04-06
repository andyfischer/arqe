
import Relation from '../Relation'
import Pattern, { commandTagsToRelation } from '../Pattern'
import { normalizeExactTag } from '../stringifyQuery'
import StorageProvider from '../StorageProvider'
import RelationSearch from '../RelationSearch'
import RelationReceiver from '../RelationReceiver'
import Graph from '../Graph'

type RelationModifier = (rel: Relation) => Relation

export default class InMemoryStorage implements StorageProvider {
    graph: Graph
    relationsByNtag: { [ ntag: string]: Relation } = {};

    constructor(graph: Graph) {
        this.graph = graph;
    }

    *linearScan(pattern: Pattern) {
        for (const ntag in this.relationsByNtag) {
            const rel = this.relationsByNtag[ntag];
 
            if (pattern.matches(rel)) {
                yield rel;
            }
        }
    }

    *findAllMatches(pattern: Pattern) {
        for (const rel of this.linearScan(pattern)) {
            yield rel;
        }
    }

    runSearch(search: RelationSearch) {
        for (const rel of this.findAllMatches(search.pattern)) {

            search.relation(rel);

            if (search.isDone())
                break;
        }

        search.finish();
    }

    runSave(relation: Relation, output: RelationReceiver) {
        const ntag = relation.getNtag();
        const existing = this.relationsByNtag[ntag];

        if (existing) {
            let modified = existing.copy();
            modified.setPayload(relation.getPayload());
            modified.freeze();
            this.relationsByNtag[ntag] = modified;
            output.relation(modified);
            output.finish();
            this.graph.onRelationUpdatedV3(relation);
            return;
        }
        
        relation.freeze();
        this.relationsByNtag[ntag] = relation;
        output.relation(this.relationsByNtag[ntag]);
        output.finish();
        this.graph.onRelationCreated(relation);
    }

    deleteRelation(rel: Relation) {
        delete this.relationsByNtag[rel.getNtag()];
    }
}

