
import { Snapshot, Query } from '..'

export interface Relation {
    relationSubject: string
    relation: string
    relationArgs: string[]
}

export interface RelationDatabase {
    everyRelation: Relation[]
}

export function getZeroRelationDatabase(): RelationDatabase {
    return {
        everyRelation: []
    }
}

export function getRelationDatabase(key: Snapshot | Query) {
    const snapshot = (key as any).snapshot || key;

    return snapshot.getValue('relationDatabase');
}
