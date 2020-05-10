import Graph, { RespondFunc } from './Graph';
import Command from './Command';
import PatternTag from './PatternTag';
export default class GraphContext {
    graph: Graph;
    contextTags: PatternTag[];
    contextTypeMap: {
        [typeName: string]: PatternTag;
    };
    optionalContextTagMap: {
        [typeName: string]: PatternTag;
    };
    constructor(graph: Graph);
    refreshContextTypeMap(): void;
    addOptionalContextTag(tag: PatternTag): void;
    removeContextType(name: string): void;
    contextCommand(command: Command, respond: RespondFunc): void;
    _translateResponse(msg: string): string;
    run(query: string, respond: RespondFunc): void;
    runCommandParsed(command: Command, respond: RespondFunc): void;
}
