
import Relation from './Relation'
import RelationPattern from './RelationPattern'
import Command from './Command'
import { normalizeExactTag } from './stringifyQuery'
import StorageProvider from './StorageProvider'
import SetOperation from './SetOperation'
import RelationSearch from './RelationSearch'

export default class InMemoryStorage implements StorageProvider {
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
 
            if (pattern.matches(rel)) {
                yield rel;
            }
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
    }

    *findAllMatches(pattern: RelationPattern) {
        if (pattern.isMultiMatch()) {
            for (const rel of this.linearScan(pattern)) {
                yield rel;
            }
        } else {
            const one = this.findOneMatch(pattern);
            if (one)
                yield one;
        }
    }

    runSearch(search: RelationSearch) {
        for (const rel of this.findAllMatches(search.pattern)) {
            search.foundRelation(rel);
            if (search.done)
                break;
        }

        search.finishSearch();
    }

    runSave(set: SetOperation) {
        const command = set.command;

        const ntag = normalizeExactTag(command.tags);

        const existing = this.relationsByNtag[ntag];

        if (existing) {
            existing.setPayload(command.payloadStr);
            set.saveFinished(existing);
            return;
        }
        
        const relationTags = command.tags.map(tag => ({
            tagType: tag.tagType,
            tagValue: tag.tagValue
        }));

        this.relationsByNtag[ntag] = new Relation(ntag, relationTags, command.payloadStr);
        set.saveFinished(this.relationsByNtag[ntag]);
    }
}

