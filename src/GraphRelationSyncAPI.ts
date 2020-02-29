
import Graph from './Graph'
import Pattern from './Pattern'
import Relation from './Relation'
import parseCommand, { parseCommandChain } from './parseCommand'
import CommandExecution from './CommandExecution'
import { receiveToRelationList } from './RelationReceiver'
import { runCommandChain } from './ChainedExecution'
import { parseTag } from './parseCommand'
import PatternTag from './PatternTag'

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
}

export class CommandBuilderAPI {
    api: GraphRelationSyncAPI
    commands: string[]

    constructor(api: GraphRelationSyncAPI) {
    }

    pushCommandString(str: string) {
        // FIXME
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

    getOne() {
        return this.api.getOne(this.pattern.stringify());
    }

    join(joinSearch: string) {
        const builder = new CommandBuilderAPI(this.api);
        builder.pushCommandString('get ' + this.pattern.stringify());
        builder.pushCommandString('join ' + joinSearch);
        return builder;
    }
}

export default class GraphRelationSyncAPI {
    graph: Graph

    constructor(graph: Graph) {
        this.graph = graph;
    }

    run(command: string): Relation[] {
        const chain = parseCommandChain(command);

        let rels: Relation[] = null;
        const output = receiveToRelationList(l => { rels = l });

        runCommandChain(this.graph, chain, output);

        if (rels === null)
            throw new Error("Command didn't finish synchronously: " + command);

        return rels.filter(rel => !rel.hasType('command-meta'));
    }

    get(pattern: string): RelationAPI[] {
        return this.run('get ' + pattern)
            .map(rel => new RelationAPI(this, rel));
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
