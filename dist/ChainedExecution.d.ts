import Graph from './Graph';
import CommandExecution from './CommandExecution';
import CommandChain from './CommandChain';
import RelationReceiver from './RelationReceiver';
import Command from './Command';
export declare function singleCommandExecution(graph: Graph, command: Command): CommandExecution;
export declare function runCommandChain(graph: Graph, chain: CommandChain, output: RelationReceiver): void;
