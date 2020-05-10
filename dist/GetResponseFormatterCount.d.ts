import RelationReceiver from './RelationReceiver';
import Relation from './Relation';
import { RespondFunc } from './Graph';
export default class GetResponseFormatterExists implements RelationReceiver {
    count: number;
    respond: RespondFunc;
    constructor(respond: RespondFunc);
    start(): void;
    relation(rel: Relation): void;
    deleteRelation(): void;
    error(e: any): void;
    finish(): void;
    isDone(): boolean;
}
