import Graph, { RespondFunc } from './Graph';
import Relation from './Relation';
import Pattern from './Pattern';
import RelationReceiver from './RelationReceiver';
export default class GetResponseFormatter implements RelationReceiver {
    graph: Graph;
    pattern: Pattern;
    respond: RespondFunc;
    extendedResult?: boolean;
    asMultiResults?: boolean;
    asSetCommands?: boolean;
    listOnly?: boolean;
    anyResults: boolean;
    enoughResults: boolean;
    hasStarted: boolean;
    calledFinish: boolean;
    constructor(graph: Graph);
    start(): void;
    formatRelation(rel: Relation): string;
    relation(rel: Relation): void;
    error(e: any): void;
    finish(): void;
    isDone(): boolean;
}
