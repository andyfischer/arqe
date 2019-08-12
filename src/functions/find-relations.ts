
import { implement, Query } from '..'
import { getRelationDatabase } from '../types/RelationDatabase'

implement('find-relations', (query: Query) => {
    const filterArgs = query.args;

    if (filterArgs.length === 0)
        return query.respond([]);

    const filterCallbacks = [];
    for (const item of filterArgs) {
        if (item === '*')
            continue;

        return query.respond("didn't understand filter: " + item);
    }

    const relationDatabase = getRelationDatabase(query);

    const found = [];

    for (const rel of relationDatabase.everyRelation) {
        let pass = true;
        for (const callback of filterCallbacks) {
            if (!callback(rel)) {
                pass = false;
                break;
            }
        }

        if (pass)
            found.push(rel);
    }

    query.respond(found);
});

