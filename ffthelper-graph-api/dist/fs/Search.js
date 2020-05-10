"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function inheritTagCompare(graph, a, b) {
    const typeCompare = graph.ordering.compareTagTypes(a.tagType, b.tagType);
    if (typeCompare !== 0)
        return typeCompare;
    return (a.tagValue || '').localeCompare(b.tagValue);
}
function get_inherit(graph, search) {
    const inheritTags = graph.inheritTags && graph.inheritTags.get();
    // Look for any inherit tags used in this search.
    let foundInheritTagIndex = 0;
    let foundInheritTag = null;
    if (inheritTags && inheritTags.anyFound) {
        for (let tagIndex = 0; tagIndex < search.pattern.tags.length; tagIndex++) {
            const tag = search.pattern.tags[tagIndex];
            if (inheritTags.byTypeName[tag.tagType]) {
                if (!foundInheritTag || inheritTagCompare(graph, foundInheritTag, tag) < 0) {
                    foundInheritTagIndex = tagIndex;
                    foundInheritTag = tag;
                }
            }
        }
    }
    if (foundInheritTag) {
        // Found an inherit tag.
        // Search for exact matches that include the inherit tag.
        return get_after_inherit(graph, {
            pattern: search.pattern,
            subSearchDepth: search.subSearchDepth + 1,
            relation(rel) { search.relation(rel); },
            isDone() { return search.isDone(); },
            start() { },
            finish() {
                // Try dropping this tag and then restarting.
                get_inherit(graph, {
                    pattern: search.pattern.dropTagIndex(foundInheritTagIndex),
                    subSearchDepth: search.subSearchDepth + 1,
                    relation(rel) { search.relation(rel); },
                    start() { },
                    finish() { search.finish(); },
                    isDone() { return search.isDone(); }
                });
            }
        });
    }
    get_after_inherit(graph, search);
}
function get_after_inherit(graph, search) {
    for (const mount of graph.iterateMounts()) {
        if (mount.pattern.isSupersetOf(search.pattern)) {
            mount.storage.runSearch(search);
            return;
        }
    }
    graph.inMemory.runSearch(search);
}
function runSearch(graph, search) {
    if (!graph)
        throw new Error('missing: graph');
    if (search.subSearchDepth > 100) {
        throw new Error('subSearchDepth is over 100, possible infinite loop');
    }
    get_inherit(graph, search);
}
exports.runSearch = runSearch;
