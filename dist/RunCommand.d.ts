import Graph from './Graph';
import CommandStep from './CommandStep';
import CommandChain from './CommandChain';
import RelationReceiver from './RelationReceiver';
import Command from './Command';
export declare function singleCommandExecution(graph: Graph, command: Command): CommandStep;
export declare function runCommandChain(graph: Graph, chain: CommandChain, output: RelationReceiver): void;
