
import path from 'path'
import fs from 'fs-extra'
import os from 'os'
import { getDateStamp } from '../timedate'

export function userDir() {
    return path.join(os.homedir(), '.futureshell');
}

export async function setupUserDir() {
    const dir = userDir();

    if (!await fs.exists(dir))
        await fs.mkdir(dir);

    const env = path.join(dir, 'env.p');
    if (!await fs.exists(env))
        await fs.writeFile(env, '');
}

export async function appendToLog(logName: string, str: string) {
    const file = path.join(userDir(), 'logs', logName, getDateStamp());

    fs.outputFile(file, str + "\n", { flag: 'a' });
}
