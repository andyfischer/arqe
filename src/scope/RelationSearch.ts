
import ParsedTag from './ParsedTag'

function hasTagPrefix(parsedTag: ParsedTag, prefix: string) {
    for (const tag of parsedTag.tags)
        if (tag.startsWith(prefix))
            return true;

    return false;
}

export default class RelationSearch {
    latestMatches: { [remainingTag:string]: true } = {}

    exactTags: string[] = []
    tagPrefixes: string[] = []
    tagCount: number

    matches(parsedTag: ParsedTag) {
        if (parsedTag.tagCount !== this.tagCount)
            return false;

        for (const exact of this.exactTags) {
            if (!parsedTag.tagTable[exact])
                return false;
        }

        for (const prefix of this.tagPrefixes) {
            if (!hasTagPrefix(parsedTag, prefix))
                return false;
        }

        return true;
    }

    maybeInclude(parsedTag: ParsedTag) {
        if (this.matches(parsedTag))
            this.latestMatches[parsedTag.normalizedString] = true;
    }
}
