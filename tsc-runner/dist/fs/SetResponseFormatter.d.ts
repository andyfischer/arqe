import Command from './Command';
import Relation from './Relation';
import Graph, { RespondFunc } from './Graph';
import RelationReceiver from './RelationReceiver';
export default class SetResponseFormatter implements RelationReceiver {
    respond: RespondFunc;
    graph: Graph;
    replyWithEcho: boolean;
    constructor(graph: Graph, command: Command, respond: RespondFunc);
    start(): void;
    relation(rel: Relation): void;
    deleteRelation(): void;
    isDone(): boolean;
    finish(): void;
}
