"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hookObjectSpace_1 = require("./hookObjectSpace");
function runSearch(graph, search) {
    if (!graph)
        throw new Error('missing: graph');
    if (search.subSearchDepth > 100) {
        throw new Error('subSearchDepth is over 100, possible infinite loop');
    }
    get_inherit(graph, search);
}
exports.default = runSearch;
function inheritTagCompare(graph, a, b) {
    const typeCompare = graph.ordering.compareTagTypes(a.tagType, b.tagType);
    if (typeCompare !== 0)
        return typeCompare;
    return (a.tagValue || '').localeCompare(b.tagValue);
}
function get_inherit(graph, search) {
    const inheritTags = graph.inheritTags && graph.inheritTags.get();
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
        return get_after_inherit(graph, {
            pattern: search.pattern,
            subSearchDepth: search.subSearchDepth + 1,
            relation(rel) { search.relation(rel); },
            finish() {
                get_inherit(graph, {
                    pattern: search.pattern.dropTagIndex(foundInheritTagIndex),
                    subSearchDepth: search.subSearchDepth + 1,
                    relation(rel) { search.relation(rel); },
                    finish() { search.finish(); },
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
    if (hookObjectSpace_1.hookObjectSpaceSearch(graph, search))
        return;
    for (const slot of graph.inMemory.iterateSlots(search.pattern)) {
        search.relation(slot.relation);
    }
    search.finish();
}
//# sourceMappingURL=runSearch.js.map