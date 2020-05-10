import { RespondFunc } from './Graph';
import Schema from './Schema';
import Relation from './Relation';
import RelationPattern from './RelationPattern';
import RelationReceiver from './RelationReceiver';
export default class GetResponseFormatter implements RelationReceiver {
    schema: Schema;
    pattern: RelationPattern;
    respond: RespondFunc;
    extendedResult?: boolean;
    asMultiResults?: boolean;
    asSetCommands?: boolean;
    listOnly?: boolean;
    anyResults: boolean;
    enoughResults: boolean;
    hasStarted: boolean;
    calledFinish: boolean;
    start(): void;
    formatRelation(rel: Relation): string;
    relation(rel: Relation): void;
    error(e: any): void;
    finish(): void;
    isDone(): boolean;
}
