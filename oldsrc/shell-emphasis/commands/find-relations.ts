
import { Query } from '..'
import { getRelationDatabase } from '../types/RelationDatabase'
import { Snapshot } from '../framework'

export default function(snapshot: Snapshot) {
    snapshot.implement('find-relations', (query: Query) => {
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
}
