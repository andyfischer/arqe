"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GetResponseFormatter_1 = __importDefault(require("./GetResponseFormatter"));
function inheritTagCompare(graph, a, b) {
    const typeCompare = graph.schema.ordering.compareTagTypes(a.tagType, b.tagType);
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
function get_after_inherit(graph, search) {
    for (const mount of graph.iterateMounts()) {
        if (mount.pattern.isSupersetOf(search.pattern)) {
            mount.storage.runSearch(search);
            return;
        }
    }
    graph.inMemory.runSearch(search);
}
class GetOperation {
    constructor(graph, command) {
        this.foundRelation = (rel) => {
            if (this.done)
                return;
            this.output.relation(rel);
            if (this.expectOne) {
                this.finishSearch();
                return;
            }
        };
        this.finishSearch = () => {
            if (this.done)
                return;
            this.output.finish();
            this.done = true;
        };
        this.graph = graph;
        this.flags = command.flags;
        this.pattern = command.toPattern();
        this.expectOne = !this.pattern.isMultiMatch();
    }
    outputToStringRespond(respond, configFormat) {
        if (this.output)
            throw new Error("already have a configured output");
        const formatter = new GetResponseFormatter_1.default();
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
    outputToRelationList(onDone) {
        if (this.output)
            throw new Error("already have a configured output");
        const list = [];
        this.output = {
            start() { },
            relation(rel) { list.push(rel); },
            finish() {
                onDone(list);
            }
        };
    }
    run() {
        if (!this.output)
            throw new Error("no output was configured");
        this.output.start();
        get_inherit(this.graph, this);
    }
}
exports.default = GetOperation;
