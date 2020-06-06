
import Pattern from './Pattern'
import PatternTag from './PatternTag'
import { newTagFromObject } from './PatternTag'
import { tagsToPattern } from './Pattern'

type PatternJSON = { [key: string]: any }

function oneKeyValueToTag(key: string, value: any) {
    if (key === '**') {
        return newTagFromObject({doubleStar: true});
    }

    if (key === '*') {
        return newTagFromObject({star: true});
    }

    if (Array.isArray(value)) {
        return value.map(valueEl => oneKeyValueToTag(key, valueEl));
    }

    if (value.attr && key[0] === '$') {
        const identifier = key.slice(1);

        let starValue = value.match === '*';
        return newTagFromObject({
            tagType: value.attr,
            identifier,
            starValue: value.match === '*',
            tagValue: value.value
        });
    }

    if (value && value.match === '*') {
        return newTagFromObject({tagType: key, starValue: true});
    }

    if (value === true) {
        return newTagFromObject({tagType: key});
    }

    if (typeof value === 'string')
        return newTagFromObject({tagType: key, tagValue: value});

    if (typeof value === 'number')
        return newTagFromObject({tagType: key, tagValue: value + ""});


    throw new Error(`Don't know how to convert into a tag: ${key}, ${value}`);
}

export default function parseObjectToPattern(obj: PatternJSON): Pattern {
    let tags: PatternTag[] = [];

    for (const k in obj) {
        const result = oneKeyValueToTag(k, obj[k]);
        if (Array.isArray(result))
            tags = tags.concat(result);
        else
            tags.push(result);
    }

    return tagsToPattern(tags);
}

function oneTagToKeyValue(tag: PatternTag, out: PatternJSON) {

    function addOutput(key: string, value: any) {
        if (out[key]) {
            if (Array.isArray(out[key])) {
                out[key].push(value);
            } else {
                out[key] = [out[key], value];
            }
        } else {
            out[key] = value;
        }
    }

    if (tag.doubleStar) {
        out['**'] = true;
        return
    }

    if (tag.star) {
        out['*'] = true;
        return
    }

    if (tag.identifier) {
        let details: any = {};

        if (tag.tagType)
            details.attr = tag.tagType;

        if (tag.starValue)
            details.match = "*";

        if (tag.tagValue)
            details.value = "*";

        addOutput('$' + tag.identifier, details);
        return;
    }

    if (tag.starValue) {
        addOutput(tag.tagType, {match: "*"});
        return
    }

    if (!tag.tagValue) {
        addOutput(tag.tagType, true);
        return
    }

    if (tag.tagValue) {
        addOutput(tag.tagType, tag.tagValue);
        return;
    }

    throw new Error('unhandled case in parseObjectToPattern: ' + tag.stringify());
}

export function parsePatternToObject(pattern: Pattern): PatternJSON {
    const out: PatternJSON = {}

    for (const tag of pattern.tags) {
        oneTagToKeyValue(tag, out);
    }

    return out;
}
