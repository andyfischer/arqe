
import Command, { CommandFlags } from './Command'
import CommandExecution from './CommandExecution'
import Graph, { RespondFunc } from './Graph'
import Schema from './Schema'
import Relation from './Relation'
import RelationPattern, { PatternTag } from './RelationPattern'
import StorageProvider from './StorageProvider'
import { commandTagToString } from './stringifyQuery'
import GetResponseFormatter from './GetResponseFormatter'
import GetResponseFormatterCount from './GetResponseFormatterCount'
import GetResponseFormatterExists from './GetResponseFormatterExists'
import RelationSearch from './RelationSearch'
import RelationReceiver from './RelationReceiver'

interface Step {
    storage: StorageProvider
    pattern: RelationPattern
}

function inheritTagCompare(graph: Graph, a: PatternTag, b: PatternTag) {
    const typeCompare = graph.schema.ordering.compareTagTypes(a.tagType, b.tagType);
    if (typeCompare !== 0)
        return typeCompare;

    return (a.tagValue || '').localeCompare(b.tagValue);
}

function get_inherit(graph: Graph, search: RelationSearch) {
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
        return get_after_inherit(graph, {
            pattern: search.pattern,
            foundRelation: search.foundRelation,
            done: search.done,
            finishSearch() {

                // Try dropping this tag and then restarting.
                get_inherit(graph, {
                    pattern: search.pattern.dropTagIndex(foundInheritTagIndex),
                    foundRelation: search.foundRelation,
                    finishSearch: search.finishSearch
                });
            }
        });
    }

    get_after_inherit(graph, search);
}

function get_after_inherit(graph: Graph, search: RelationSearch) {
    
    for (const mount of graph.iterateMounts()) {
        if (mount.pattern.isSupersetOf(search.pattern)) {
            mount.storage.runSearch(search);
            return;
        }
    }

    graph.inMemory.runSearch(search);
}

export default class GetOperation implements RelationSearch {
    graph: Graph;
    flags: CommandFlags
    commandExec: CommandExecution
    pattern: RelationPattern;

    expectOne: boolean
    done: boolean
    onDone?: () => void

    constructor(graph: Graph, commandExec: CommandExecution) {
        this.graph = graph;
        const command = commandExec.command;
        this.flags = command.flags;
        this.pattern = command.toPattern();
        this.expectOne = !this.pattern.isMultiMatch() || command.flags.exists;
        this.commandExec = commandExec;
    }

    foundRelation = (rel: Relation) => {
        if (this.done)
            return;
        
        this.commandExec.output.relation(rel);

        if (this.expectOne) {
            this.finishSearch();
            return;
        }
    }

    run() {
        if (!this.commandExec.output)
            throw new Error("no output was configured");

        this.commandExec.output.start();
        get_inherit(this.graph, this);
    }

    finishSearch = () => {
        if (this.done)
            return;

        this.commandExec.output.finish();
        this.done = true;
    }
}
