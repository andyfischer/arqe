import PatternTag, { FixedTag } from './PatternTag';
export declare class PatternValue implements Pattern {
    tags: PatternTag[];
    payload: string | null;
    payloadUnavailable?: true;
    hasDerivedData: boolean;
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
    byIdentifier: {
        [identifier: string]: PatternTag;
    };
    constructor(tags: PatternTag[]);
    updateDerivedData(): void;
    copyWithNewTags(tags: PatternTag[]): PatternValue;
    remapTags(func: (tag: PatternTag) => PatternTag): PatternValue;
    getNtag(): string;
    tagCount(): number;
    hasPayload(): boolean;
    getValue(): string;
    getPayload(): string;
    setValue(payload: any): void;
    setPayload(payload: string | null): this;
    isSupersetOf(subPattern: Pattern): boolean;
    matches(rel: Pattern): boolean;
    isMultiMatch(): boolean;
    formatRelationRelative(rel: Pattern): string;
    hasType(typeName: string): boolean;
    hasValueForType(typeName: string): boolean;
    getOneTagForType(typeName: string): PatternTag;
    getTagObject(typeName: string): PatternTag;
    getTag(typeName: string): string;
    getTagString(typeName: string): string;
    getTagValue(typeName: string): string;
    getTagValueOptional(typeName: string, defaultValue: any): any;
    dropTagIndex(index: number): PatternValue;
    setTagValueAtIndex(index: number, value: any): PatternValue;
    findTagWithType(tagType: string): PatternTag;
    findTagIndexOfType(tagType: string): number;
    updateTagOfType(tagType: string, update: (t: PatternTag) => PatternTag): PatternValue;
    updateTagAtIndex(index: number, update: (t: PatternTag) => PatternTag): PatternValue;
    removeType(typeName: string): PatternValue;
    removeTypes(typeNames: string[]): PatternValue;
    addTag(s: string): PatternValue;
    addTags(strs: string[]): PatternValue;
    str(): string;
    stringify(): string;
    stringifyRelation(): string;
    stringifyToCommand(): string;
}
export default interface Pattern {
    tags: PatternTag[];
    tagCount: () => number;
    fixedTags: FixedTag[];
    starValueTags: PatternTag[];
    tagsForType: {
        [typename: string]: PatternTag[];
    };
    byIdentifier: {
        [identifier: string]: PatternTag;
    };
    hasType: (t: string) => boolean;
    getNtag: () => string;
    getTag: (t: string) => string;
    getTagValue: (t: string) => string | boolean | any;
    getTagString: (t: string) => string;
    getOneTagForType: (t: string) => PatternTag;
    hasValueForType: (t: string) => boolean;
    payloadUnavailable?: boolean;
    getPayload: () => string;
    hasPayload: () => boolean;
    setPayload: (val: string) => Pattern;
    addTag: (t: string) => Pattern;
    addTags: (t: string[]) => Pattern;
    removeType: (t: string) => Pattern;
    removeTypes: (t: string[]) => Pattern;
    dropTagIndex: (n: number) => Pattern;
    setTagValueAtIndex: (index: number, value: any) => Pattern;
    findTagWithType: (tagType: string) => PatternTag;
    findTagIndexOfType: (tagType: string) => number;
    updateTagOfType: (tagType: string, update: (t: PatternTag) => PatternTag) => Pattern;
    updateTagAtIndex: (index: number, update: (t: PatternTag) => PatternTag) => Pattern;
    remapTags: (func: (PatternTag: any) => PatternTag) => Pattern;
    matches: (p: Pattern) => boolean;
    isSupersetOf: (p: Pattern) => boolean;
    stringify: () => string;
    stringifyRelation: () => string;
}
export declare function commandToRelationPattern(str: string): PatternValue;
export declare function patternFromMap(map: Map<string, string>): PatternValue;
export declare function commandTagsToRelation(tags: PatternTag[], payload: string): Pattern;
export declare function parsePattern(query: string): PatternValue;
