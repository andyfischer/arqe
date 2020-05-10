import Command, { CommandFlags } from './Command';
import Graph, { RespondFunc } from './Graph';
import Relation from './Relation';
import RelationPattern from './RelationPattern';
import RelationReceiver from './RelationReceiver';
import RelationSearch from './RelationSearch';
export default class CommandExecution {
    graph: Graph;
    flags: CommandFlags;
    command: Command;
    commandName: string;
    pattern: RelationPattern;
    input?: RelationReceiver;
    output: RelationReceiver;
    start?: () => void;
    constructor(graph: Graph, command: Command);
    toRelationSearch(): RelationSearch;
    outputTo(receiver: RelationReceiver): void;
    outputToStringRespond(respond: RespondFunc): void;
    outputToRelationList(onDone: (rels: Relation[]) => void): void;
}
