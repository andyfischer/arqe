
import Pattern from './Pattern'
import PatternTag from './PatternTag'
import { newTagFromObject } from './PatternTag'
import { tagsToPattern } from './Pattern'

function oneKeyValueToTag(key: string, value: any): PatternTag {
    if (key === '**') {
        return newTagFromObject({doubleStar: true});
    }

    if (key === '*') {
        return newTagFromObject({star: true});
    }

    if (Array.isArray(value))
        return newTagFromObject({tagType: key, valueExpr: value});

    if (value === '*') {
        return newTagFromObject({tagType: key, starValue: true});
    }

    return newTagFromObject({tagType: key, tagValue: value});
}

export default function parseObjectToPattern(obj: { [key: string]: any }): Pattern {
    const tags: PatternTag[] = [];

    for (const k in obj) {
        tags.push(oneKeyValueToTag(k, obj[k]));
    }

    return tagsToPattern(tags);
}
