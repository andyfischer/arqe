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
export default class RelationPattern {
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
    copy(): RelationPattern;
    copyWithNewTags(tags: PatternTag[]): RelationPattern;
    getNtag(): string;
    tagCount(): number;
    hasPayload(): boolean;
    getValue(): string;
    getPayload(): string;
    setValue(payload: any): void;
    setPayload(payload: string | null): void;
    isSupersetOf(subPattern: RelationPattern): boolean;
    matches(rel: RelationPattern): boolean;
    isMultiMatch(): boolean;
    formatRelationRelative(rel: RelationPattern): string;
    hasType(typeName: string): boolean;
    hasValueForType(typeName: string): boolean;
    getOneTagForType(typeName: string): PatternTag;
    getTag(typeName: string): string;
    getTagString(typeName: string): string;
    getTagValue(typeName: string): string;
    getTagValueOptional(typeName: string, defaultValue: any): any;
    dropTagIndex(index: number): RelationPattern;
    removeType(typeName: string): RelationPattern;
    addTag(s: string): RelationPattern;
    stringify(): string;
    stringifyToCommand(): string;
}
export declare function commandToRelationPattern(str: string): RelationPattern;
export declare function commandTagsToRelation(tags: PatternTag[], payload: string): RelationPattern;
export declare function parsePattern(query: string): RelationPattern;
