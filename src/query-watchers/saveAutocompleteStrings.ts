
import { Query } from '..'

export default function(query: Query) {
    console.log('autocompleteInfo saw', query.syntax.originalStr);
    query.snapshot.modifyGlobal('autocompleteInfo', (info) => {
        if (!info) {
            info = { 
                everyWord: {}
            };
        }

        for (const clause of query.syntax.clauses) {
            info.everyWord[clause.key] = true;
        }

        return info;
    });
}
