import Command, { CommandFlags } from './Command';
import Graph from './Graph';
import Pattern from './Pattern';
import SearchOperation from './SearchOperation';
import RelationPipe from './RelationPipe';
export default class CommandStep {
    graph: Graph;
    flags: CommandFlags;
    command: Command;
    commandName: string;
    pattern: Pattern;
    input: RelationPipe;
    output: RelationPipe;
    constructor(graph: Graph, command: Command);
    toRelationSearch(): SearchOperation;
}
