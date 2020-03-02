
import fs from 'fs-extra'
import path from 'path'
import { TypescriptWriter } from '../codewriter/ts'
import { listModulesInsideFolder } from './utils'
import { toIdentifier } from '../codewriter/shared'

export default async function generateCommandImports() {
    const dir = path.join(__dirname, '../../src/commands');
    const modules = await listModulesInsideFolder(dir);
    const out = new TypescriptWriter();

    /*
    for (const moduleName of modules) {
        const fromFile = `./${moduleName}`;
        out.import_(null, fromFile);
    }
    */

    out.import_('{ Snapshot }', '../framework')
    for (const moduleName of modules)
        out.import_(moduleName, `./${moduleName}`);

    out.blankLine()

    out.openBlock("export function implementEveryCommand(snapshot: Snapshot) {")
    for (const moduleName of modules)
        out.line(`${toIdentifier(moduleName)}(snapshot);`)

    out.closeBlock()

    await out.writeToFile(path.join(dir, 'index.ts'));
}
