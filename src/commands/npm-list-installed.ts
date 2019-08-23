
import fs from 'fs-extra'
import fg from 'fast-glob'
import { implement, print, error, performedAction } from '..'

function by(items, key) {
    const result = {};

    for (const item of items) {
        const k = key(item);
        if (!result[k])
            result[k] = [];
        result[k].push(item);
    }

    return Object.values(result);
}

function where(items, condition) {
    return items.filter(condition);
}

implement('npm-list-installed', async (query) => {

    const out = { items: [] }
    const everyPackageFile = await fg("node_modules/**/package.json");

    const everyPackage = [];

    for (const file of everyPackageFile) {
        const packageInfo = JSON.parse(await fs.readFile(file, 'utf8'));
        everyPackage.push(packageInfo);
    }

    const byName = by(everyPackage, p => p.name);

    query.respond({items: byName.filter(items => items.length > 1).map(item => item[0].name)});

    //query.respond({list: dupes});
});
