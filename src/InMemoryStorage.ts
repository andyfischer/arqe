
import Relation from './Relation'
import Pattern, { commandTagsToRelation } from './Pattern'
import PatternTag, { newTag } from './PatternTag'
import Command from './Command'
import { normalizeExactTag } from './stringifyQuery'
import StorageProvider from './StorageProvider'
import SetOperation from './SetOperation'
import RelationSearch from './RelationSearch'
import RelationReceiver from './RelationReceiver'

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

    *linearScan(pattern: Pattern) {
        for (const ntag in this.relationsByNtag) {
            const rel = this.relationsByNtag[ntag];
 
            if (pattern.matches(rel)) {
                yield rel;
            }
        }
    }

    findExactMatch(pattern: Pattern): Relation|null {
        // Exact tag lookup.
        const ntag = normalizeExactTag(pattern.tags);
        return this.relationsByNtag[ntag]
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

    runSave(command: Command, output: RelationReceiver) {
        const ntag = normalizeExactTag(command.tags);

        const existing = this.relationsByNtag[ntag];

        if (existing) {
            let modified = existing.copy();
            modified.setPayload(command.payloadStr);
            modified.freeze();
            this.relationsByNtag[ntag] = modified;
            output.relation(modified);
            output.finish();
            return;
        }
        
        const relationTags: PatternTag[] = command.tags.map(tag => (newTag(
            tag.tagType,
            tag.tagValue
        )));

        const rel = commandTagsToRelation(relationTags, command.payloadStr);
        rel.freeze();
        this.relationsByNtag[ntag] = rel;
        output.relation(this.relationsByNtag[ntag]);
        output.finish();
    }
}

