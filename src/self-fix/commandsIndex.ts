
import fs from 'fs-extra'
import path from 'path'
import { TypescriptWriter } from '../codewriter/ts'
import { listModulesInsideFolder } from './utils'

export default async function generateCommandImports() {
    const out = new TypescriptWriter();
    const dir = path.join(__dirname, '../../src/commands');
    const modules = await listModulesInsideFolder(dir);

    for (const moduleName of modules) {
        const fromFile = `./${moduleName}`;
        out.import_(null, fromFile);
    }

    await out.writeToFile(path.join(dir, 'index.ts'));
}
