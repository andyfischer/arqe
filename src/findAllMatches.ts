
import StorageProvider from './StorageProvider'
import Graph from './Graph'
import RelationPattern from './RelationPattern'

interface Step {
    storage: StorageProvider
    pattern: RelationPattern
}

/**
 * For the list 'items', iterate across every possible way to omit each item.
 * Start by omitting them one at a time, then omit any two, etc.
 *
 * There's a few tweaks (compared to a plain powerSet)
 *  - We skip over the [].
 *  - We start by omitting the last items first.
 *
 * This is used to implement 'inherit' tags. We first search for relations
 * with the inherit tag included, then we repeat the search with that tag
 * omitted.
 */
export function* inheritPowerSet(items: any[]) {

    let max = 1 << items.length;

    for (let nth = 1; nth < max; nth++) {
        let bits = nth;

        const filtered = []

        for (let itemIndex = items.length - 1; itemIndex >= 0; itemIndex--) {
            if (bits & 1)
                filtered.push(items[itemIndex]);

            bits >>>= 1;
        }

        yield filtered;
    }
}

function* steps(graph: Graph, pattern: RelationPattern): IterableIterator<Step> {
    yield {
        storage: graph.inMemory,
        pattern
    };

    // Handle inherit tags
    const inheritTagTypes = []
    for (const tag of pattern.tags) {
        const tagInfo = graph.schema.findTagType(tag.tagType);
        if (tagInfo.inherits) {
            inheritTagTypes.push(tag.tagType);
        }
    }

    for (const skipTypes of inheritPowerSet(inheritTagTypes)) {
        let subPattern: RelationPattern = pattern; 

        for (const t of skipTypes)
            subPattern = subPattern.patternWithoutType(t);

        yield {
            storage: graph.inMemory,
            pattern: subPattern
        }
    }
}

export default function *findAllMatches(graph: Graph, pattern: RelationPattern) {

    let expectOne = !pattern.isMultiMatch();

    for (const step of steps(graph, pattern)) {
        for (const rel of step.storage.findAllMatches(step.pattern)) {
            yield rel;

            if (expectOne)
                return;
        }
    }
}

// next todo
//   finish hooking up RawObjectStorage - be able to mount it
