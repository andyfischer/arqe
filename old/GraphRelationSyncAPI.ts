
import Graph from './Graph'
import Pattern from './Pattern'
import Relation from './Relation'
import parseCommand, { parsePattern, parseCommandChain } from './parseCommand'
import CommandExecution from './CommandExecution'
import { receiveToRelationList } from './RelationReceiver'
import { runCommandChain } from './ChainedExecution'
import { parseTag } from './parseCommand'
import PatternTag from './PatternTag'
import CommandChain from './CommandChain'

export class TagAPI {
    api: GraphRelationSyncAPI
    patternTag: PatternTag

    constructor(api: GraphRelationSyncAPI, patternTag: PatternTag) {
        this.api = api;
        this.patternTag = patternTag;
    }

    add(tagStr: string) {
        const tag = parseTag(tagStr);
        return new RelationAPI(this.api, new Pattern([this.patternTag, tag]));
    }

    value() {
        return this.patternTag.tagValue;
    }

    str() {
        return this.patternTag.str();
    }
}

export class CommandBuilderAPI {
    api: GraphRelationSyncAPI
    commands: string[] = []

    constructor(api: GraphRelationSyncAPI) {
        this.api = api;
    }

    pushCommandString(str: string) {
        this.commands.push(str);
    }

    rels() {
        const commandChainStr = this.commands.join(' | ');
        const commandChain = parseCommandChain(commandChainStr);
        return this.api.runCommandChain(commandChain);
    }
}

export class RelationAPI {
    api: GraphRelationSyncAPI
    pattern: Pattern

    constructor(api: GraphRelationSyncAPI, pattern: Pattern) {
        this.api = api;
        this.pattern = pattern;
    }

    value() {
        return this.pattern.getValue()
    }

    tag(tagType: string) {
        return new TagAPI(this.api, this.pattern.getTagObject(tagType));
    }

    tagValue(tagType: string) {
        return this.pattern.getTagObject(tagType).tagValue;
    }

    get() {
        return this.api.get(this.pattern.str());
    }

    getOne() {
        return this.api.getOne(this.pattern.str());
    }

    join(joinSearch: string) {
        const builder = new CommandBuilderAPI(this.api);
        builder.pushCommandString('get ' + this.pattern.str());
        builder.pushCommandString('join ' + joinSearch);
        return builder;
    }
}

export default class GraphRelationSyncAPI {
    graph: Graph

    constructor(graph: Graph) {
        this.graph = graph;
    }

    runCommandChain(chain: CommandChain): RelationAPI[] {
        let rels: Relation[] = null;
        const output = receiveToRelationList(l => { rels = l });

        runCommandChain(this.graph, chain, output);

        if (rels === null)
            throw new Error("Command didn't finish synchronously: " + chain.str());

        return rels
            .filter(rel => !rel.hasType('command-meta'))
            .map(rel => new RelationAPI(this, rel));
    }

    run(command: string): RelationAPI[] {
        const chain = parseCommandChain(command);
        return this.runCommandChain(chain);
    }

    pattern(pattern: string): RelationAPI {
        return new RelationAPI(this, parsePattern(pattern));
    }

    get(pattern: string): RelationAPI[] {
        return this.run('get ' + pattern);
    }

    getOne(pattern: string): RelationAPI {
        const rels = this.get(pattern);
        if (rels.length === 0)
            throw new Error("getOne didn't find any relations for: " + pattern);

        if (rels.length > 1)
            throw new Error("getOne found multple relations for: " + pattern);

        return rels[0];
    }
}
