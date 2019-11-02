
import ParsedTag from './ParsedTag'
import Graph from './Graph'
import FindExtResult from './FindExtResult'

interface FoundMatch {
    remainingTag: string
}

function findTagWithPrefix(parsedTag: ParsedTag, prefix: string) {
    for (const tag of parsedTag.tags)
        if (tag.startsWith(prefix))
            return tag;

    return null;
}

export default class LiveSearch {
    latestMatches: { [tag:string]: FoundMatch } = {}

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
            if (findTagWithPrefix(parsedTag, prefix) === null)
                return false;
        }

        return true;
    }

    toFoundMatch(parsedTag: ParsedTag): FoundMatch {

        // Figure out the remaining tag.
        if (this.tagPrefixes.length === 1) {
            for (const prefix of this.tagPrefixes) {
                const tag = findTagWithPrefix(parsedTag, prefix);

                return {
                    remainingTag: tag.substring(prefix.length)
                }
            }
        } else {
            return {
                remainingTag: ''
            }
        }
    }

    maybeInclude(parsedTag: ParsedTag) {
        if (this.matches(parsedTag)) {
            this.latestMatches[parsedTag.normalizedString] = this.toFoundMatch(parsedTag);
        }
    }

    maybeDelete(tag: string) {
        delete this.latestMatches[tag];
    }

    latest(graph: Graph): any[] {
        const results = []

        for (const normalizedTag in this.latestMatches) {
            const value = graph.relations[normalizedTag].value;
            results.push(value);
        }
        return results;
    }

    latestExt(graph: Graph): FindExtResult[] {
        const results: FindExtResult[] = []

        for (const normalizedTag in this.latestMatches) {
            const matchInfo = this.latestMatches[normalizedTag];
            const value = graph.relations[normalizedTag].value;

            results.push({
                value,
                tag: normalizedTag,
                remainingTag: matchInfo.remainingTag
            })
        }

        return results;
    }
}
