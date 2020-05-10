import Graph from './Graph';
import Pattern from './Pattern';
import PatternTag from './PatternTag';
import CommandChain from './CommandChain';
export declare class TagAPI {
    api: GraphRelationSyncAPI;
    patternTag: PatternTag;
    constructor(api: GraphRelationSyncAPI, patternTag: PatternTag);
    add(tagStr: string): RelationAPI;
    value(): string;
    str(): string;
}
export declare class CommandBuilderAPI {
    api: GraphRelationSyncAPI;
    commands: string[];
    constructor(api: GraphRelationSyncAPI);
    pushCommandString(str: string): void;
    rels(): RelationAPI[];
}
export declare class RelationAPI {
    api: GraphRelationSyncAPI;
    pattern: Pattern;
    constructor(api: GraphRelationSyncAPI, pattern: Pattern);
    value(): string;
    tag(tagType: string): TagAPI;
    tagValue(tagType: string): string;
    get(): RelationAPI[];
    getOne(): RelationAPI;
    join(joinSearch: string): CommandBuilderAPI;
}
export default class GraphRelationSyncAPI {
    graph: Graph;
    constructor(graph: Graph);
    runCommandChain(chain: CommandChain): RelationAPI[];
    run(command: string): RelationAPI[];
    pattern(pattern: string): RelationAPI;
    get(pattern: string): RelationAPI[];
    getOne(pattern: string): RelationAPI;
}
