import Command from './Command';
import Relation from './Relation';
import RelationPattern from './RelationPattern';
import Graph from './Graph';
import StorageProvider from './StorageProvider';
interface Step {
    storage: StorageProvider;
    subtractTypes?: string[];
}
export default class ExecutionPlan {
    steps: Step[];
    constructor(graph: Graph, command: Command);
    findAllMatches(pattern: RelationPattern): IterableIterator<any>;
    save(command: Command): Relation;
}
export {};
