
import { patternTagToString } from './stringifyQuery'

export interface PatternTagOptions {
    tagType?: string
    tagValue?: string
    valueExpr?: string[]
    negate?: boolean
    star?: boolean
    doubleStar?: boolean
    starValue?: boolean
    questionValue?: boolean
    identifier?: string
}

export default class PatternTag {
    tagType?: string
    tagValue?: string
    valueExpr?: string[]
    negate?: boolean
    star?: boolean
    doubleStar?: boolean
    starValue?: boolean
    questionValue?: boolean
    identifier?: string

    isFrozen?: boolean

    str() {
        return patternTagToString(this);
    }

    stringify() {
        return patternTagToString(this);
    }

    copy(): PatternTag {
        const tag = new PatternTag();
        tag.tagType = this.tagType;
        tag.tagValue = this.tagValue;
        tag.negate = this.negate;
        tag.star = this.star;
        tag.doubleStar = this.doubleStar;
        tag.starValue = this.starValue;
        tag.questionValue = this.questionValue;
        tag.identifier = this.identifier;
        return tag;
    }

    freeze() {
        if (this.isFrozen)
            return;
        
        this.isFrozen = true;
        Object.freeze(this);
        return this;
    }

    setValue(value: string): PatternTag {
        const out = this.copy();
        out.tagValue = value;
        delete out.starValue;
        delete out.valueExpr;
        out.freeze();
        return out;
    }

    setStarValue(): PatternTag {
        const out = this.copy();
        out.starValue = true;
        delete out.tagValue;
        delete out.valueExpr;
        out.freeze();
        return out;
    }

    setIdentifier(id: string): PatternTag {
        const out = this.copy();
        out.identifier = id;
        out.freeze();
        return out;
    }

    removeIdentifier(): PatternTag {
        return this.setIdentifier(null);
    }

    setValueExpr(expr: string[]): PatternTag {
        const out = this.copy();
        out.valueExpr = expr;
        delete out.tagValue;
        // TODO: don't set starValue for expr
        out.starValue = true;
        return out;
    }
}

export type FixedTag = PatternTag;

export function newTag(tagType: string, tagValue?: string): PatternTag {
    const tag = new PatternTag();
    tag.tagType = tagType;
    tag.tagValue = tagValue;
    return tag;
}

export function newTagFromObject(obj: PatternTagOptions) {
    const tag = new PatternTag();
    for (const k in obj)
        tag[k] = obj[k];

    if (tag.tagValue === undefined)
        tag.tagValue = null;

    return tag;
}
