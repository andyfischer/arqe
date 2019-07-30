
import os from 'os'
import fs from 'fs-extra'
import path from 'path'

export default async function setupUserDir() {
    const dir = path.join(os.homedir(), '.futureshell');
    if (!await fs.exists(dir))
        await fs.mkdir(dir);

    const env = path.join(dir, 'env.p');
    if (!await fs.exists(env))
        await fs.writeFile(env, '');
}
