
import Relation from './Relation'
import RelationPattern, { commandTagsToRelation } from './RelationPattern'
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
        delete this.relationsByNtag[rel.getNtag()];
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
        const ntag = normalizeExactTag(pattern.tags);
        return this.relationsByNtag[ntag]
    }

    *findAllMatches(pattern: RelationPattern) {
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

        this.relationsByNtag[ntag] = commandTagsToRelation(relationTags, command.payloadStr);
        set.saveFinished(this.relationsByNtag[ntag]);
    }
}

