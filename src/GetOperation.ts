
import Command, { CommandTag } from './Command'
import Graph, { RespondFunc } from './Graph'
import Schema from './Schema'
import TagType from './TagType'
import Relation from './Relation'
import RelationPattern from './RelationPattern'
import StorageProvider from './StorageProvider'
import { commandTagToString } from './stringifyQuery'
import GetResponseFormatter from './GetResponseFormatter'

interface Step {
    storage: StorageProvider
    pattern: RelationPattern
}

export interface GetOperationOutput {
    start: () => void
    relation: (rel: Relation) => void
    finish: () => void
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
export function* powerSet(keys: any[]) {

    let max = 1 << keys.length;

    for (let nth = 1; nth < max; nth++) {
        let bits = nth;

        const resultSet = {};

        for (let keyIndex = keys.length - 1; keyIndex >= 0; keyIndex--) {
            if (bits & 1)
                resultSet[keys[keyIndex]] = true;

            bits >>>= 1;
        }

        yield resultSet;
    }
}

function* steps(graph: Graph, pattern: RelationPattern): IterableIterator<Step> {

    // look for custom mounts
    for (const mount of graph.iterateMounts()) {
        if (mount.pattern.isSupersetOf(pattern)) {
            yield {
                storage: mount.storage,
                pattern
            }
            return;
        }
    }

    yield {
        storage: graph.inMemory,
        pattern
    };

    // Handle inherit tags
    const inheritTagIndexes: number[] = []
    for (let i = 0; i < pattern.tags.length; i++) {
        const tag = pattern.tags[i];
        const tagInfo = graph.schema.findTagType(tag.tagType);
        if (tagInfo.inherits) {
            inheritTagIndexes.push(i);
        }
    }

    if (inheritTagIndexes.length === 0)
        return;

    for (const skipIndexSet of powerSet(inheritTagIndexes)) {
        const subTags = [];
        for (let i = 0; i < pattern.tags.length; i++) {
            if (!skipIndexSet[i])
                subTags.push(pattern.tags[i]);
        }

        const subPattern = new RelationPattern(subTags);

        yield {
            storage: graph.inMemory,
            pattern: subPattern
        }
    }
}

/*
// Look for branch tags in the get pattern
//   If any found
//     Get results stored in that branch
//     Modify search pattern to remove branch tag
//
// Look for custom storage
//   If any found
//     Get results from custom storage and then stop
// 
// Finally
//   Get results from in-memory storage
//
// Need to make GetOperation take a pluggable formatter so that in-memory can receive
// results as just Relation objects.
*/

function step1(get: GetOperation) {
}

export default class GetOperation {
    graph: Graph;
    command: Command;
    pattern: RelationPattern;
    expectOne: boolean

    steps: Step[]
    currentStep: number = 0

    done: boolean
    onDone?: () => void

    output: GetOperationOutput;

    constructor(graph: Graph, command: Command) {
        this.graph = graph;
        this.command = command;
        this.pattern = command.toPattern();

        this.steps = Array.from(steps(graph, this.pattern));

        this.expectOne = !this.pattern.isMultiMatch();
    }

    outputToStringRespond(respond: RespondFunc, config?: (formatter: GetResponseFormatter) => void) {
        if (this.output)
            throw new Error("already have a configured output");

        const formatter = new GetResponseFormatter(); 
        formatter.extendedResult = this.command.flags.x;
        formatter.listOnly = this.command.flags.list;
        formatter.asMultiResults = this.pattern.isMultiMatch();
        formatter.respond = respond;
        formatter.pattern = this.pattern;
        formatter.schema = this.graph.schema;

        if (config)
            config(formatter);

        this.output = formatter;
    }

    foundRelation(rel: Relation) {
        if (this.done)
            return;
        
        this.output.relation(rel);

        if (this.expectOne) {
            this.finish();
            return;
        }
    }

    finishSearch() {
        if (this.done)
            return;

        this.currentStep += 1;
        this.startNextStep();
    }

    private startNextStep() {
        if (this.currentStep >= this.steps.length) {
            this.finish();
            return;
        }

        const step = this.steps[this.currentStep];
        this.pattern = step.pattern;
        step.storage.runSearch(this);
    }

    perform() {
        if (!this.output)
            throw new Error("no output was configured");

        this.output.start();
        this.startNextStep();
    }

    finish() {
        if (this.done)
            return;

        this.output.finish();
        this.done = true;
    }
}
