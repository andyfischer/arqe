
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

export default class GetOperation {
    graph: Graph;
    command: Command;
    pattern: RelationPattern;
    formatter: GetResponseFormatter;
    expectOne: boolean

    steps: Step[]
    currentStep: number = 0

    done: boolean
    onDone?: () => void

    constructor(graph: Graph, command: Command, respond: RespondFunc) {
        this.graph = graph;
        this.command = command;
        this.pattern = command.toPattern();

        this.formatter = new GetResponseFormatter();
        this.formatter.extendedResult = this.command.flags.x;
        this.formatter.listOnly = this.command.flags.list;
        this.formatter.asMultiResults = this.pattern.isMultiMatch();
        this.formatter.respond = respond;
        this.formatter.pattern = this.pattern;
        this.formatter.schema = graph.schema;

        this.steps = Array.from(steps(graph, this.pattern));

        this.expectOne = !this.pattern.isMultiMatch();
    }

    foundRelation(rel: Relation) {
        if (this.done)
            return;
        
        this.formatter.respondRelation(rel);

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
        this.formatter.start();
        this.startNextStep();
    }

    finish() {
        if (this.done)
            return;

        this.formatter.finish();
        this.done = true;
    }
}
