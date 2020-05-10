export interface PatternTag {
    tagType?: string;
    tagValue?: string;
    negate?: boolean;
    star?: boolean;
    doubleStar?: boolean;
    starValue?: boolean;
    questionValue?: boolean;
    unboundType?: string;
    unboundValue?: string;
}
export interface FixedTag {
    tagType: string;
    tagValue: string;
}
export default class Pattern {
    tags: PatternTag[];
    payload: string | null;
    payloadUnavailable?: true;
    wasDeleted?: true;
    starValueTags: PatternTag[];
    fixedTags: FixedTag[];
    fixedTagsForType: {
        [typename: string]: true;
    };
    tagsForType: {
        [typename: string]: PatternTag[];
    };
    hasStar?: boolean;
    hasDoubleStar?: boolean;
    ntag?: string;
    isFrozen: boolean;
    constructor(tags: PatternTag[]);
    freeze(): void;
    copy(): Pattern;
    copyWithNewTags(tags: PatternTag[]): Pattern;
    getNtag(): string;
    tagCount(): number;
    hasPayload(): boolean;
    getValue(): string;
    getPayload(): string;
    setValue(payload: any): void;
    setPayload(payload: string | null): void;
    isSupersetOf(subPattern: Pattern): boolean;
    matches(rel: Pattern): boolean;
    isMultiMatch(): boolean;
    formatRelationRelative(rel: Pattern): string;
    hasType(typeName: string): boolean;
    hasValueForType(typeName: string): boolean;
    getOneTagForType(typeName: string): PatternTag;
    getTag(typeName: string): string;
    getTagString(typeName: string): string;
    getTagValue(typeName: string): string;
    getTagValueOptional(typeName: string, defaultValue: any): any;
    dropTagIndex(index: number): Pattern;
    removeType(typeName: string): Pattern;
    addTag(s: string): Pattern;
    stringify(): string;
    stringifyToCommand(): string;
}
export declare function commandToRelationPattern(str: string): Pattern;
export declare function commandTagsToRelation(tags: PatternTag[], payload: string): Pattern;
export declare function parsePattern(query: string): Pattern;
