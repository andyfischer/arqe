import RelationReceiver from './RelationReceiver';
import Relation from './Relation';
import { RespondFunc } from './Graph';
export default class GetResponseFormatterExists implements RelationReceiver {
    hasReplied: boolean;
    respond: RespondFunc;
    constructor(respond: RespondFunc);
    start(): void;
    relation(rel: Relation): void;
    deleteRelation(): void;
    error(e: any): void;
    isDone(): boolean;
    finish(): void;
}
