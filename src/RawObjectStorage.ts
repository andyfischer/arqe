
import Relation, { commandTagsToRelation } from './Relation'
import RelationPattern from './RelationPattern'
import RelationSearch from './RelationSearch'
import Command from './Command'
import { commandTagsToString } from './stringifyQuery'
import StorageProvider from './StorageProvider'
import GetOperation from './GetOperation'
import SetOperation from './SetOperation'

export default class RawObjectStorage implements StorageProvider {
    linkedPattern: RelationPattern
    value: any = {}
    variedType: string

    constructor(pattern: RelationPattern) {
        this.linkedPattern = pattern;

        if (pattern.starValueTags.length !== 1) {
            throw new Error("RawObjectStorage expected to link with a single star value pattern, saw: "
                            + commandTagsToString(pattern.tags));
        }

        this.variedType = pattern.starValueTags[0].tagType;
    }

    *findAllMatches(pattern: RelationPattern) {
        const variedTag = pattern.getOneTagForType(this.variedType);
        const otherTags = pattern.tags.filter(tag => tag.tagType !== variedTag.tagType);

        if (variedTag.starValue) {
            for (const key in this.value) {
                yield commandTagsToRelation(otherTags.concat({
                    tagType: variedTag.tagType,
                    tagValue: key
                }), this.value[key]);
            }
        } else {
            const key = variedTag.tagValue;

            if (this.value[key] !== undefined) {
                yield commandTagsToRelation(otherTags.concat({
                    tagType: variedTag.tagType,
                    tagValue: key
                }), this.value[key]);
            }
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
        set.saveFinished(new Relation('', [], ''));
    }
}
