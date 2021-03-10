
import Tuple from './Tuple'

export default class TableMatcher {
    declaredSchema: Tuple
    requiredAttrs = new Map<string, true>()
    allowedAttrs = new Map<string, true>()

    constructor(declaredSchema: Tuple) {
        this.declaredSchema = declaredSchema;

        if (declaredSchema.getVerb() === 'table') {
            // Newer style with 'table' verb.
            for (const tag of declaredSchema.tags) {
                if (tag.attr === 'keys' || tag.attr === 'required') {
                    for (const keyTag of tag.value.tags) {
                        this.requiredAttrs.set(keyTag.attr, true);
                        this.allowedAttrs.set(keyTag.attr, true);
                    }
                } else if (tag.attr === 'values') {
                    // ???
                } else if (tag.attr === 'table') {
                    // ignore
                } else {
                    this.allowedAttrs.set(tag.attr, true);
                }
            }


        } else {
            // Older style.
            for (const tag of declaredSchema.tags) {
                if (tag.getTupleVerb() === 'key') {
                    this.requiredAttrs.set(tag.attr, true);
                    this.allowedAttrs.set(tag.attr, true);
                } else {
                    this.allowedAttrs.set(tag.attr, true);
                }
            }
        }

        // If no tuples were explicitly marked required, then they are all required.

        if (this.requiredAttrs.size === 0) {
            this.requiredAttrs = this.allowedAttrs;
        }
    }

    matches(pattern: Tuple): boolean {
        // Pattern must have the required table keys.
        for (const requiredAttr of this.requiredAttrs.keys()) {
            if (!pattern.hasAttr(requiredAttr))
                return false;
        }

        // Table must have every required attribute on the pattern
        for (const tag of pattern.tags) {
            if (tag.optional)
                continue;
            if (!this.allowedAttrs.get(tag.attr))
                return false;
        }

        return true;
    }
}
