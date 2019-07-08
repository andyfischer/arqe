
import { Query } from '..'
import { print } from '../utils'
import { Snapshot } from '../framework'

export default function(snapshot: Snapshot) {
    snapshot.implement('show-commands', (query: Query) => {
        const db = query.get('commandDB');
        query.respond(JSON.stringify(db, null, 2));
    });
}
