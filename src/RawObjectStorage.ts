
import Relation from './Relation'
import RelationPattern from './RelationPattern'
import Command from './Command'
import { commandArgsToString } from './parseCommand'
import DataProvider from './DataProvider'

export default class RawObjectStorage implements DataProvider {
    linkedPattern: RelationPattern
    value = {}
    variedType: string

    constructor(pattern: RelationPattern) {
        this.linkedPattern = pattern;

        if (pattern.starValueTags.length !== 1) {
            throw new Error("RawObjectStorage expected to link with a single star value pattern, saw: " + commandArgsToString(pattern.command.tags));
        }

        this.variedType = pattern.starValueTags[0].tagType;
    }

    *findAllMatches(pattern: RelationPattern) {
        const tag = pattern.getOneTagForType(this.variedType);
        if (tag.starValue) {
            for (const k in this.value) {
                // yield new Relation
            }
        } else {
            // yield new Relation
        }
    }

    save(command: Command) {
        return new Relation('', [], '');
    }
}
