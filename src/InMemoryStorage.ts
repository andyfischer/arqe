
import Relation from './Relation'
import RelationPattern from './RelationPattern'
import Command, { CommandTag } from './Command'
import { DataProvider } from './ExecutionPlan'

export default class InMemoryStorage implements DataProvider {
    relationsByNtag: { [ ntag: string]: Relation } = {};

    *everyRelation() {
        for (const ntag in this.relationsByNtag) {
            yield this.relationsByNtag[ntag];
        }
    }

    deleteRelation(rel: Relation) {
        delete this.relationsByNtag[rel.ntag];
    }

    *linearScan(pattern: RelationPattern) {
        for (const ntag in this.relationsByNtag) {
            const rel = this.relationsByNtag[ntag];

            if (pattern.matches(rel))
                yield rel;
        }
    }

    findExactMatch(pattern: RelationPattern): Relation|null {
        // Exact tag lookup.
        return this.relationsByNtag[pattern.ntag]
    }

    findOneMatch(pattern: RelationPattern): Relation { 
        const found = this.findExactMatch(pattern);
        if (found)
            return found;

        if (pattern.hasInheritTags) {
            for (const match of this.linearScan(pattern)) {
                return match;
            }
        }
    }

    *findAllMatches(pattern: RelationPattern) {
        if (pattern.isMultiMatch()) {
            yield *this.linearScan(pattern);
        } else {
            const one = this.findOneMatch(pattern);
            if (one)
                yield one;
        }
    }
}
