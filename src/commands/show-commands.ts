
import { implement, Query } from '..'
import { print } from '../utils'

implement('show-commands', (query: Query) => {
    const db = query.get('commandDB');
    query.respond(JSON.stringify(db, null, 2));
});
