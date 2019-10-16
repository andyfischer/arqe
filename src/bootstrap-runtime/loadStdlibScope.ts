
import os from 'os'
import path from 'path'
import fs from 'fs-extra'

import { Scope } from '../scope'
import { VM } from '../vm'

async function loadFile(scope: Scope, filename: string) {
    const contents = await fs.readFile(filename, 'utf8');
}

export default async function loadStdlibScope() {
    const scope = new Scope();
    const vm = new VM(scope);

    await loadFile(scope, `${__dirname}/../../data/_bootstrap.p`);

    /*

    for (const script in snapshot.getValue('bootstrapScripts').scripts)
        await loadDataFile(snapshot, `${__dirname}/../../data/${script}`);

    const userEnv = path.join(os.homedir(), '.futureshell/env.p');
    await loadDataFile(snapshot, userEnv);

    if (await fs.exists('.fshell'))
        await loadDataFile(snapshot, '.fshell');
    */
}
