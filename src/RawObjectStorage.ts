
import Relation, { commandTagsToRelation } from './Relation'
import RelationPattern from './RelationPattern'
import Command from './Command'
import { commandArgsToString } from './parseCommand'
import DataProvider from './DataProvider'

export default class RawObjectStorage implements DataProvider {
    linkedPattern: RelationPattern
    value: any = {}
    variedType: string

    constructor(pattern: RelationPattern) {
        this.linkedPattern = pattern;

        if (pattern.starValueTags.length !== 1) {
            throw new Error("RawObjectStorage expected to link with a single star value pattern, saw: " + commandArgsToString(pattern.command.tags));
        }

        this.variedType = pattern.starValueTags[0].tagType;
    }

    *findAllMatches(pattern: RelationPattern) {
        const variedTag = pattern.getOneTagForType(this.variedType);
        const otherTags = pattern.command.tags.filter(tag => tag.tagType !== variedTag.tagType);

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

    save(command: Command) {
        return new Relation('', [], '');
    }
}



/*

todo


function patternToRelation(pattern: RelationPattern, fillValue: (typeName: string) => string): Relation {

    const tags: CommandTag[] = [];
    for (const tag of pattern.fixedArgs)
        tags.push(tag);
    for (const tag of pattern.starValueTags)
        tags.push(tag);
    const tags = pattern.command.tags.map((tag: CommandTag) => {
    });

    return new Relation()
}
*/
