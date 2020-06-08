
import Command from './Command'
import Graph from './Graph'
import parseCommand, { parseTag } from './parseCommand'
import { normalizeExactTag, patternTagToString, commandTagsToString } from './stringifyQuery'
import PatternTag, { newTag, FixedTag } from './PatternTag'

function expressionMatches(expr: string[], subExpr: string[]) {
    if (expr.length !== subExpr.length)
        return false;

    for (let i = 0; i < expr.length; i++) {
        if (typeof expr[i] !== 'string' || expr[i] !== subExpr[i])
            return false;
    }

    return true;
}

class MatchHelper {
    tuple: Tuple
    countsByAttr: { [attr: string]: { min: number, max?: number } } = {}
    valueTagsByAttr: { [ attr: string]: PatternTag[] } = {}

    constructor(tuple: Tuple) {
        this.tuple = tuple;
        for (const tag of tuple.tags) {
            if (!tag.attr)
                continue;

            const attr = tag.attr;

            this.valueTagsByAttr[attr] = this.valueTagsByAttr[attr] || [];
            this.countsByAttr[attr] = this.countsByAttr[attr] || {
                min: 0,
                max: 0
            };

            if (tag.optional) {
                this.countsByAttr[attr].max += 1;
            } else {
                this.countsByAttr[attr].min += 1;
                this.countsByAttr[attr].max += 1;
            }

            if (tag.tagValue || tag.valueExpr) {
                this.valueTagsByAttr[attr].push(tag);
            }
        }
    }

    findMatchingFixedTag(valueTag: PatternTag, tags: PatternTag[]) {
        if (valueTag.tagValue) {
            for (const tag of tags) {
                if (tag.tagValue === valueTag.tagValue)
                    return true;
            }

            return false;
        }

        if (valueTag.valueExpr) {
            for (const tag of tags) {
                if (expressionMatches(valueTag.valueExpr, tag.valueExpr))
                    return true;
            }

            return false;
        }
    }

    isSupersetCheckOneAttr(attr: string, subPattern: Tuple) {
        const thisTags = this.tuple.tagsByAttr[attr];
        const subTags = subPattern.tagsByAttr[attr];

        // Check min/max counts
        const { min, max } = this.countsByAttr[attr];

        const foundCount = subTags ? subTags.length : 0;

        if (foundCount < min)
            return false;

        if (foundCount > max)
            return false;

        for (const valueTag of this.valueTagsByAttr[attr]) {
            if (!this.findMatchingFixedTag(valueTag, subTags))
                return false;
        }

        return true;
    }
}


export default class Tuple {
    
    tags: PatternTag[] = []

    // derived data
    minimumTagCount: number
    sortedTags: PatternTag[] = null
    hasDerivedData: boolean
    starValueTags: PatternTag[] = []
    fixedTags: FixedTag[] = []
    fixedTagsForType: { [typename: string]: true } = {}
    tagsByAttr: { [typename: string]: PatternTag[] } = {}
    hasStar?: boolean
    hasDoubleStar?: boolean
    byIdentifier: { [identifier: string]: PatternTag } = {}
    matchHelper?: MatchHelper

    constructor(tags: PatternTag[]) {
        if (!Array.isArray(tags))
            throw new Error("expected 'tags' to be an Array");

        this.tags = tags;
        this.updateDerivedData();
        Object.freeze(this.tags);
    }

    getSortedTags() {
        if (this.sortedTags === null) {
            const sortedTags = this.tags.concat([]);
            sortedTags.sort((a, b) => a.compareCanonicalSort(b));
            this.sortedTags = sortedTags;
        }
        return this.sortedTags;
    }

    getMatchHelper() {
        if (!this.matchHelper)
            this.matchHelper = new MatchHelper(this);
        return this.matchHelper;
    }

    updateDerivedData() {
        if (this.hasDerivedData)
            return;

        let minimumTagCount = 0;

        for (const tag of this.tags) {
            const { attr } = tag;

            if (attr) {
                if (!this.tagsByAttr[attr])
                    this.tagsByAttr[attr] = [];

                this.tagsByAttr[attr].push(tag);
            }

            if (tag.doubleStar) {
                this.hasDoubleStar = true;
            } else if (tag.star) {
                this.hasStar = true;

            } else if (tag.starValue) {
                this.starValueTags.push(tag);
            } else {
                this.fixedTags.push(tag as FixedTag);
                this.fixedTagsForType[tag.attr] = true;
            }

            if (!tag.doubleStar && !tag.optional)
                minimumTagCount += 1;

            if (tag.identifier)
                this.byIdentifier[tag.identifier] = tag;
        }

        this.hasDerivedData = true;
        this.minimumTagCount = minimumTagCount;
    }

    copyWithNewTags(tags: PatternTag[]) {
        const pattern = new Tuple(tags);
        return pattern;
    }

    remapTags(func: (tag:PatternTag) => PatternTag) {
        const tags = this.tags.map(func)
            .filter(tag => tag);
        return this.copyWithNewTags(tags);
    }

    modifyTagsList(func: (tags: PatternTag[]) => PatternTag[]) {
        const tags = func(this.tags);
        return this.copyWithNewTags(tags);
    }

    tagCount() {
        return this.tags.length;
    }


    findMatchOfOneTag(tag: PatternTag, subPattern: Tuple) {
        if (tag.star || tag.doubleStar)
            // Tag has no type, always matches.
            return true;

        const tagsByAttr = subPattern.tagsByAttr[tag.attr];

        if (!tagsByAttr || tagsByAttr.length == 0)
            // No matching tags for this type, stop here.
            return false;

        // Here - There is at least one tag matching the type.

        if (tag.starValue)
            // Tag matches any value, success.
            return true;

        if (!tag.tagValue && !tag.valueExpr)
            // Tag matches any value, success.
            return true;

        for (const subTag of tagsByAttr) {
            if (subTag.starValue)
                continue;

            if (tag.tagValue) {
                if (tag.tagValue === subTag.tagValue)
                    return true;
            }

            if (tag.valueExpr) {
                if (subTag.valueExpr && expressionMatches(tag.valueExpr, subTag.valueExpr))
                    return true;
            }
        }

        return false;
    }

    isSupersetOfOld(subPattern: Tuple) {

        if (this.hasDoubleStar) {
            const tagCountWithoutDoubleStar = this.tagCount() - 1;

            if (tagCountWithoutDoubleStar == 0)
                // This pattern is just '**'
                return true;

            if (subPattern.tagCount() < tagCountWithoutDoubleStar)
                // Sub pattern doesn't have enough tags.
                return false;

        } else {
            // Sub pattern doesn't have the right number of tags.
            if (subPattern.tagCount() !== this.tagCount())
                return false;
        }

        for (const tag of this.tags)
            if (!this.findMatchOfOneTag(tag, subPattern))
                return false;

        return true;
    }

    isSupersetOf(subPattern: Tuple) {
        const oldResult = this.isSupersetOfOld(subPattern);
        const newResult = this.isSupersetOf2(subPattern);

        if (oldResult !== newResult)
            console.error(`refactor error on isSupersetOf2 ${this.stringify()} ${subPattern.stringify()} ${oldResult} ${newResult}`)

        return oldResult;
    }

    matches(rel: Tuple) {
        return this.isSupersetOf(rel);
    }

    isSupersetOf2(subPattern: Tuple) {

        const matchHelper = this.getMatchHelper();

        if (subPattern.hasDoubleStar && !this.hasDoubleStar)
            return false;

        if (subPattern.hasStar && !this.hasStar)
            return false;

        // Check each attr
        for (const attr in this.tagsByAttr) {
            if (!matchHelper.isSupersetCheckOneAttr(attr, subPattern))
                return false;
        }
        
        // Check if subPattern has extra attrs that we don't have.
        if (!this.hasDoubleStar && !this.hasStar) {
            for (const subAttr in subPattern.tagsByAttr)
                if (!this.tagsByAttr[subAttr])
                    return false;
        }

        return true;
    }

    equals(rhs: Tuple) {
        if (this === rhs)
            return true;

        if (this.tags.length !== rhs.tags.length)
            return false;

        for (let i = 0; i < this.tags.length; i++) {
            const leftTag = this.getSortedTags()[i];
            const rightTag = rhs.getSortedTags()[i];
            if (!leftTag.equals(rightTag))
                return false;
        }

        return true;
    }

    isMultiMatch() {
        return this.hasStar || this.hasDoubleStar || (this.starValueTags.length > 0);
    }

    formatRelationRelative(rel: Tuple) {
        const outTags = [];

        for (const tag of rel.tags) {
            if (this.fixedTagsForType[tag.attr])
                continue;

            outTags.push(patternTagToString(tag));
        }

        const str = outTags.join(' ');
        return str;
    }

    hasType(typeName: string) {
        return !!this.tagsByAttr[typeName];
    }

    hasValueForType(typeName: string) {
        if (!this.hasType(typeName))
            return false;

        for (const tag of this.tagsByAttr[typeName])
            if (tag.tagValue != null)
                return true;

        return false;
    }

    getOneTagForType(typeName: string): PatternTag {
        const tags = this.tagsByAttr[typeName];
        if (!tags)
            return null;

        if (tags.length > 1)
            throw new Error("getOneTagForType - multiple tags found for: " + typeName);

        return tags[0];
    }

    getTagObject(typeName: string): PatternTag {
        const tag = this.getOneTagForType(typeName);
        if (!tag)
            throw new Error('tag not found for type: ' + typeName);

        return tag;
    }

    getTag(typeName: string) {
        const tag = this.getOneTagForType(typeName);

        if (!tag)
            throw new Error('tag not found for type: ' + typeName);

        if (!tag.tagValue)
            return typeName;

        return typeName + '/' + tag.tagValue;
    }

    getTagString(typeName: string) {
        return this.getTag(typeName);
    }

    getValueForType(typeName: string) {
        const tag = this.getOneTagForType(typeName);
        if (!tag)
            throw new Error(`type "${typeName}" not found in pattern: ${this.stringify()}`);

        return tag.tagValue;
    }

    getTagValue(typeName: string) {
        return this.getValueForType(typeName);
    }

    getTagValueOptional(typeName: string, defaultValue) {
        const tag = this.getOneTagForType(typeName);
        if (!tag)
            return defaultValue;

        return tag.tagValue;
    }

    dropTagIndex(index: number) {
        if (index >= this.tags.length)
            throw new Error('index out of range: ' + index);

        return this.copyWithNewTags(this.tags.slice(0,index).concat(this.tags.slice(index + 1)));
    }

    setTagValueAtIndex(index: number, value: any) {
        const tags = this.tags.map(t => t);
        tags[index] = tags[index].copy();
        tags[index].tagValue = value;

        return this.copyWithNewTags(tags);
    }

    setValueForType(tagType: string, value: any) {
        return this.remapTags(tag => {
            if (tag.attr === tagType) {

                if (value === null)
                    return null;

                if (value === true)
                    return tag.setValueless();

                return tag.setValue(value);
            }
            return tag;
        });
    }

    setTagValueForType(tagType: string, value: any) {
        return this.setValueForType(tagType, value);
    }

    findTagForType(tagType: string) {
        for (let i = 0; i < this.tags.length; i++)
            if (this.tags[i].attr === tagType)
                return this.tags[i];
        return null;
    }

    findTagWithType(tagType: string) {
        return this.findTagForType(tagType);
    }

    findTagIndexOfType(tagType: string) {
        for (let i = 0; i < this.tags.length; i++)
            if (this.tags[i].attr === tagType)
                return i;
        return -1;
    }

    updateTagOfType(tagType: string, update: (t: PatternTag) => PatternTag) {
        const index = this.findTagIndexOfType(tagType);
        if (index === -1)
            throw new Error('tag type not found: ' + tagType);
        return this.updateTagAtIndex(index, update);
    }

    updateTagAtIndex(index: number, update: (t: PatternTag) => PatternTag) {
        const tags = this.tags.map(t => t);
        tags[index] = update(tags[index]);
        return this.copyWithNewTags(tags);
    }

    removeType(typeName: string) {
        return this.copyWithNewTags(this.tags.filter(tag => tag.attr !== typeName));
    }

    removeTypes(typeNames: string[]) {
        return this.copyWithNewTags(this.tags.filter(tag => typeNames.indexOf(tag.attr) === -1));
    }

    addTagStr(s: string) {
        return this.copyWithNewTags(this.tags.concat([parseTag(s)]));
    }

    addTagObj(tag: PatternTag) {
        return this.copyWithNewTags(this.tags.concat([tag]));
    }

    addNewTag(tagType: string, tagValue?: string) {
        return this.addTagObj(newTag(tagType, tagValue));
    }

    addTags(strs: string[]) {
        return this.copyWithNewTags(this.tags.concat(strs.map(parseTag)));
    }

    str() {
        return commandTagsToString(this.tags);
    }

    stringify() {
        return commandTagsToString(this.tags);
    }

    stringifyRelation() {
        return this.stringify();
    }

    stringifyToCommand() {
        let commandPrefix = 'set ';

        return commandPrefix + this.stringifyRelation();
    }

    isCommandMeta() {
        return this.hasType('command-meta');
    }

    isCommandError() {
        return this.hasType('command-meta') && this.hasType('error');
    }
}

export function patternFromObject(object: { [k: string]: string }) {
    const tags = [];

    for (const key in object) {
        tags.push(newTag(key, object[key]));
    }

    return new Tuple(tags);
}

export function patternFromMap(map: Map<string,string>) {
    const tags = []
    for (const [key,value] of map.entries()) {
        const tag = new PatternTag({ attr: key, tagValue: value });
        tags.push(tag);
    }

    return new Tuple(tags);
}

export function tagsToPattern(tags: PatternTag[]): Tuple {
    return new Tuple(tags)
}


