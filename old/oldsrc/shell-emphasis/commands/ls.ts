
import { Query } from '..'
import fs from 'fs-extra'
import { Snapshot } from '../framework'

export default function(snapshot: Snapshot) {
    snapshot.implement('ls', async (query: Query) => {
        const dir = await fs.readdir('.');
        query.respond({ items: dir });
    });
}
