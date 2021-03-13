
import Tuple, { newTuple } from './Tuple'

export default class TableMatcher {
    schema: Tuple
    matchesStar: boolean
    starAttr: string
    requiredAttrs = new Map<string, true>()
    allowedAttrs = new Map<string, true>()

    constructor(schema: Tuple) {
        this.schema = schema;
        this.matchesStar = false;

        for (const tag of schema.tags) {

            if (tag.getTupleVerb() === 'key') {
                this.requiredAttrs.set(tag.attr, true);
                this.allowedAttrs.set(tag.attr, true);
            } else if (tag.getTupleVerb() === 'star') {
                this.matchesStar = true;
                this.starAttr = tag.attr;
            } else {
                this.allowedAttrs.set(tag.attr, true);
            }
        }
    }

    matches(pattern: Tuple): boolean {

        // A table can be used for a pattern IFF:
        //  - The pattern has EVERY required table attribute.
        //  - The pattern has NO attributes that are outside the table.
        //
        // The pattern can optionally have attributes that are non-required on the table.

        // Pattern must have the required table keys.
        for (const requiredAttr of this.requiredAttrs.keys()) {
            if (!pattern.hasAttr(requiredAttr))
                return false;
        }

        // Table must have every required attribute on the pattern.
        if (!this.matchesStar) {
            for (const tag of pattern.tags) {
                if (tag.optional)
                    continue;
                if (!this.allowedAttrs.get(tag.attr))
                    return false;
            }
        }

        return true;
    }
}
