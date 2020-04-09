
import { commandTagToString } from './stringifyQuery'

interface NewTagOptions {
    tagType?: string
    tagValue?: string
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
    negate?: boolean
    star?: boolean
    doubleStar?: boolean
    starValue?: boolean
    questionValue?: boolean
    identifier?: string

    isFrozen?: boolean

    str() {
        return commandTagToString(this);
    }

    copy() {
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
}

export type FixedTag = PatternTag;

export function newTag(tagType: string, tagValue?: string): PatternTag {
    const tag = new PatternTag();
    tag.tagType = tagType;
    tag.tagValue = tagValue;
    return tag;
}

export function newTagFromObject(obj: NewTagOptions) {
    const tag = new PatternTag();
    for (const k in obj)
        tag[k] = obj[k];
    return tag;
}
