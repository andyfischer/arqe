export interface PatternTagOptions {
    tagType?: string;
    tagValue?: string;
    valueExpr?: string[];
    negate?: boolean;
    star?: boolean;
    doubleStar?: boolean;
    starValue?: boolean;
    questionValue?: boolean;
    identifier?: string;
}
export default class PatternTag {
    tagType?: string;
    tagValue?: string;
    valueExpr?: string[];
    negate?: boolean;
    star?: boolean;
    doubleStar?: boolean;
    starValue?: boolean;
    questionValue?: boolean;
    identifier?: string;
    isFrozen?: boolean;
    str(): string;
    stringify(): string;
    copy(): PatternTag;
    freeze(): this;
    setValue(value: string): PatternTag;
    setStarValue(): PatternTag;
    setIdentifier(id: string): PatternTag;
}
export declare type FixedTag = PatternTag;
export declare function newTag(tagType: string, tagValue?: string): PatternTag;
export declare function newTagFromObject(obj: PatternTagOptions): PatternTag;
