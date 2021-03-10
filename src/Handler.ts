
import Tuple, { newTuple, isTuple, newTupleWithVerb } from './Tuple'
import Tag, { newTag, newSimpleTag } from './Tag';
import Query from './Query'
import TableMount, { TupleStreamCallback } from './TableMount'

function getTagsWithUnique(tuple: Tuple) {
    return tuple.tags.filter((tag: Tag) => tag.getTupleVerb() === 'unique');
}

function getRequiredValueTags(tuple: Tuple) {
    return tuple.tags.filter((tag: Tag) => {
        const verb = tag.getTupleVerb();
        if (verb === 'unique')
            return false;
        if (verb === 'env')
            return false;
        if (verb === 'subquery')
            return false;
        if (verb === 'scope')
            return false;
        return !!tag.attr;
    })
}

export default class Handler {
    verb: string
    mountPattern: Tuple
    requiredValues: Tag[]
    tagsWithUnique: Tag[]
    mount: TableMount

    nativeCallback?: TupleStreamCallback
    query?: Query

    constructor(mount: TableMount, verb: string, mountPattern: Tuple) {
        this.mount = mount;
        this.verb = verb;
        this.requiredValues = getRequiredValueTags(mountPattern);
        this.tagsWithUnique = getTagsWithUnique(mountPattern);

        if (mountPattern.hasAttr("evalHelper"))
            throw new Error("internal error: CommandEntry should not see 'evalHelper' attr");

        this.mountPattern = mountPattern;
    }

    setNativeCallback(nativeCallback: TupleStreamCallback) {
        this.nativeCallback = nativeCallback;
    }

    setQuery(query: Query) {
        this.query = query;
    }

    checkHasRequiredValues(input: Tuple) {
        for (const tag of this.requiredValues) {
            const matchingTag = input.getTag(tag.attr);
            if (!matchingTag || !matchingTag.hasValue() || matchingTag.isAbstractValue())
                return false;
        }
        return true;
    }
}
