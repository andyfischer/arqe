import Command from './Command';
import CommandExecution from './CommandExecution';
import Graph from './Graph';
import Relation from './Relation';
export default class SetOperation {
    graph: Graph;
    command: Command;
    commandExec: CommandExecution;
    relation: Relation;
    constructor(graph: Graph, commandExec: CommandExecution);
    run(): void;
    saveFinished(relation?: Relation): void;
}
