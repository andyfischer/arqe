
import { Query } from '..'
import { declareCommand } from '../framework'
import { print } from '../utils'

export default declareCommand({
    name: 'show-commands',
    run(query: Query) {
        const db = query.get('commandDB');
        query.respond(JSON.stringify(db, null, 2));
    }
});
