
import { DataProvider } from './ExecutionPlan'
import Relation from './Relation'
import RelationPattern from './RelationPattern'
import Command from './Command'
import { commandArgsToString } from './parseCommand'

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
        } else {
        }
        // Respond with all the key/value pairs
    }

    save(command: Command) {
        return new Relation('', [], '');
    }
}
