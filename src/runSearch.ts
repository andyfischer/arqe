
import Command, { CommandFlags } from './Command'
import Graph from './Graph'
import Relation from './Relation'
import Pattern from './Pattern'
import StorageProvider from './StorageProvider'
import SearchOperation from './SearchOperation'
import RelationReceiver from './RelationReceiver'
import PatternTag from './PatternTag'

interface Step {
    storage: StorageProvider
    pattern: Pattern
}

export default function runSearch(search: SearchOperation) {
    if (!search.graph)
        throw new Error('missing: search.graph');

    if (search.subSearchDepth > 100) {
        throw new Error('subSearchDepth is over 100, possible infinite loop');
    }

    get_inherit(search);
}

function inheritTagCompare(graph: Graph, a: PatternTag, b: PatternTag) {
    const typeCompare = graph.ordering.compareTagTypes(a.tagType, b.tagType);
    if (typeCompare !== 0)
        return typeCompare;

    return (a.tagValue || '').localeCompare(b.tagValue);
}

function get_inherit(search: SearchOperation) {
    const graph = search.graph;
    const inheritTags = graph.inheritTags && graph.inheritTags.get();

    // Look for any inherit tags used in this search.
    let foundInheritTagIndex = 0;
    let foundInheritTag: PatternTag = null;

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
        return get_after_inherit({
            graph,
            pattern: search.pattern,
            subSearchDepth: search.subSearchDepth + 1,
            relation(rel) { search.relation(rel) },
            finish() {

                // Try dropping this tag and then restarting.
                get_inherit({
                    graph,
                    pattern: search.pattern.dropTagIndex(foundInheritTagIndex),
                    subSearchDepth: search.subSearchDepth + 1,
                    relation(rel) { search.relation(rel) },
                    finish() { search.finish() },
                });
            }
        });
    }

    get_after_inherit(search);
}

function get_after_inherit(search: SearchOperation) {

    const graph = search.graph;
    
    // Check mounts
    for (const mount of graph.iterateMounts()) {
        if (mount.pattern.isSupersetOf(search.pattern)) {
            mount.storage.runSearch(search);
            return;
        }
    }

    for (const hook of graph.saveSearchHooks) {
        if (hook.hookSearch(search))
            return;
    }

    // Fall back to in-memory
    for (const slot of graph.inMemory.iterateSlots(search.pattern)) {
        search.relation(slot.relation);
    }

    search.finish();
}

