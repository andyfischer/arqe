import PatternTag, { FixedTag } from './PatternTag';
export default class Pattern {
    tags: PatternTag[];
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
    copyWithNewTags(tags: PatternTag[]): Pattern;
    remapTags(func: (tag: PatternTag) => PatternTag): Pattern;
    modifyTagsList(func: (tags: PatternTag[]) => PatternTag[]): Pattern;
    getNtag(): string;
    tagCount(): number;
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
    dropTagIndex(index: number): Pattern;
    setTagValueAtIndex(index: number, value: any): Pattern;
    findTagWithType(tagType: string): PatternTag;
    findTagIndexOfType(tagType: string): number;
    updateTagOfType(tagType: string, update: (t: PatternTag) => PatternTag): Pattern;
    updateTagAtIndex(index: number, update: (t: PatternTag) => PatternTag): Pattern;
    removeType(typeName: string): Pattern;
    removeTypes(typeNames: string[]): Pattern;
    addTagStr(s: string): Pattern;
    addTagObj(tag: PatternTag): Pattern;
    addNewTag(tagType: string, tagValue?: string): Pattern;
    addTags(strs: string[]): Pattern;
    str(): string;
    stringify(): string;
    stringifyRelation(): string;
    stringifyToCommand(): string;
}
export declare function commandToRelationPattern(str: string): Pattern;
export declare function patternFromMap(map: Map<string, string>): Pattern;
export declare function commandTagsToRelation(tags: PatternTag[], payload?: string): Pattern;
export declare function parsePattern(query: string): Pattern;
