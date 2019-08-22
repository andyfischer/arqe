
import { implement, Query } from '..'
import fs from 'fs-extra'

implement('ls', async (query: Query) => {
    const dir = await fs.readdir('.');
    query.respond({ items: dir });
});
