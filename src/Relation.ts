
import Graph from './Graph'
import { normalizeExactTag } from './stringifyQuery'
import PatternTag, { FixedTag } from './PatternTag'
import { commandTagsToString } from './stringifyQuery'
import Pattern from './Pattern'

export default interface Relation {
    freeze: () => Relation
    copy: () => Relation
    getWriteable: () => Relation
    wasDeleted?: boolean
    tags: PatternTag[]
    tagCount: () => number
    fixedTags: FixedTag[]
    starValueTags: PatternTag[]
    tagsForType: { [typename: string]: PatternTag[] }
    byIdentifier: { [identifier: string]: PatternTag }

    hasType: (t: string) => boolean
    getNtag: () => string
    getTag: (t: string) => string
    getTagValue: (t: string) => string
    getTagString: (t: string) => string
    getOneTagForType: (t: string) => PatternTag
    hasValueForType: (t: string) => boolean
    payloadUnavailable?: boolean
    getPayload: () => string
    hasPayload: () => boolean
    setPayload: (val: string) => Pattern

    addTag: (t: string) => Relation
    removeType: (t: string) => Relation
    dropTagIndex: (n: number) => Pattern
    setTagValueAtIndex: (index: number, value: any) => Pattern;

    matches: (p: Pattern) => boolean
    isSupersetOf: (p: Pattern) => boolean

    stringify: () => string
    stringifyRelation: () => string
}

