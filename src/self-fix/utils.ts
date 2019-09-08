
import fs from 'fs-extra'
import path from 'path'

export async function listModulesInsideFolder(dir: string) {
    return (await fs.readdir(dir))
        .filter(file => file !== 'index.ts')
        .map(file => file.replace(/\.ts$/, ''));
}
