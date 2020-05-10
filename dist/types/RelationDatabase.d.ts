import { Snapshot, Query } from '..';
export interface Relation {
    relationSubject: string;
    relation: string;
    relationArgs: string[];
}
export interface RelationDatabase {
    everyRelation: Relation[];
}
export declare function getZeroRelationDatabase(): RelationDatabase;
export declare function getRelationDatabase(key: Snapshot | Query): any;
