
import Command, { CommandTag, CommandFlags } from './Command'
import Graph, { RespondFunc } from './Graph'
import Schema from './Schema'
import TagType from './TagType'
import Relation from './Relation'
import RelationPattern from './RelationPattern'
import StorageProvider from './StorageProvider'
import { commandTagToString } from './stringifyQuery'
import GetResponseFormatter from './GetResponseFormatter'
import RelationSearch from './RelationSearch'

interface Step {
    storage: StorageProvider
    pattern: RelationPattern
}

export interface GetOperationOutput {
    start: () => void
    relation: (rel: Relation) => void
    finish: () => void
}

function get_inherit(graph: Graph, search: RelationSearch) {
    const inheritTags = graph.inheritTags && graph.inheritTags.get();

    // Look for any inherit tags used in this search.
    for (let tagIndex=0; tagIndex < search.pattern.tags.length; tagIndex++) {
        const tag = search.pattern.tags[tagIndex];
        if (inheritTags && inheritTags[tag.tagType]) {

            // Found an inherit tag.
            
            // Search for exact matches that include the inherit tag.
            return get_after_inherit(graph, {
                pattern: search.pattern,
                foundRelation: search.foundRelation,
                done: search.done,
                finishSearch() {

                    // Try dropping this tag and then restarting.
                    get_inherit(graph, {
                        pattern: search.pattern.dropTagIndex(tagIndex),
                        foundRelation: search.foundRelation,
                        finishSearch: search.finishSearch
                    });
                }
            });
        }
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
    pattern: RelationPattern;

    expectOne: boolean
    done: boolean
    onDone?: () => void

    output: GetOperationOutput;

    constructor(graph: Graph, command: Command) {
        this.graph = graph;
        this.flags = command.flags;
        this.pattern = command.toPattern();
        this.expectOne = !this.pattern.isMultiMatch();
    }

    outputToStringRespond(respond: RespondFunc, configFormat?: (formatter: GetResponseFormatter) => void) {
        if (this.output)
            throw new Error("already have a configured output");

        const formatter = new GetResponseFormatter(); 
        formatter.extendedResult = this.flags.x;
        formatter.listOnly = this.flags.list;
        formatter.asMultiResults = this.pattern.isMultiMatch();
        formatter.respond = respond;
        formatter.pattern = this.pattern;
        formatter.schema = this.graph.schema;

        if (configFormat)
            configFormat(formatter);

        this.output = formatter;
    }

    outputToRelationList(onDone: (rels: Relation[]) => void) {
        if (this.output)
            throw new Error("already have a configured output");

        const list: Relation[] = [];
        this.output = {
            start() {},
            relation(rel) { list.push(rel) },
            finish() {
                onDone(list);
            }
        }
    }

    foundRelation = (rel: Relation) => {
        if (this.done)
            return;
        
        this.output.relation(rel);

        if (this.expectOne) {
            this.finishSearch();
            return;
        }
    }

    run() {
        if (!this.output)
            throw new Error("no output was configured");

        this.output.start();
        get_inherit(this.graph, this);
    }

    finishSearch = () => {
        if (this.done)
            return;

        this.output.finish();
        this.done = true;
    }
}
