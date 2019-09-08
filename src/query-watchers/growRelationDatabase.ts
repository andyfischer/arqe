
import { Query } from '..'
import { RelationDatabase, getRelationDatabase } from '../types/RelationDatabase'

export default function(query: Query) {
    if (query.relation) {
        db.everyRelation.push({
            relation: query.relation,
            relationSubject: query.relationSubject,
            relationArgs: []
        });
    }
}
