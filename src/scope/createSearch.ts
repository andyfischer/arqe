
import Graph from './Graph'
import LiveSearch from './LiveSearch'
import parseTag from './parseTag'

export default function createSearch(graph: Graph, pattern: string) {
    const items = pattern.split(' ');
    const search = new LiveSearch()

    search.tagCount = items.length;

    for (const item of items) {
        if (item === '*')
            continue;

        if (item.endsWith('*')) {
            search.tagPrefixes.push(item.replace(/\*$/, ''));
            continue;
        }

        search.exactTags.push(item);
    }

    // Update with any existing relations
    for (const existingRelationTag in graph.relations) {
        const parsed = parseTag(existingRelationTag);
        search.maybeInclude(parsed);
    }

    return search;
}
