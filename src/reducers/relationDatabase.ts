
import { Query } from '..'
import { declareReducer } from '../framework'
import { RelationDatabase, getRelationDatabase } from '../types/RelationDatabase'

function update(query: Query, db: RelationDatabase) {
    if (query.relation) {
        db.everyRelation.push({
            relation: query.relation,
            relationSubject: query.relationSubject,
            relationArgs: []
        });
    }
}

declareReducer(() => {
    return {
        name: 'relationDatabase',
        value: {},
        reducer(query: Query) {
            update(query, getRelationDatabase(query));
        }
    }
});

