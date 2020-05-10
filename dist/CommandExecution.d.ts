import Command, { CommandFlags } from './Command';
import Graph from './Graph';
import Pattern from './Pattern';
import RelationSearch from './RelationSearch';
import RelationPipe from './RelationPipe';
export default class CommandExecution {
    graph: Graph;
    flags: CommandFlags;
    command: Command;
    commandName: string;
    pattern: Pattern;
    input: RelationPipe;
    output: RelationPipe;
    constructor(graph: Graph, command: Command);
    toRelationSearch(): RelationSearch;
}
