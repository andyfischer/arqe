
import fs from 'fs-extra'
import path from 'path'

import { TypescriptWriter } from '../codewriter/ts'
import { toIdentifier } from '../codewriter/shared'
import { listModulesInsideFolder } from './utils'

export default async function() {
    const dir = path.join(__dirname, '../../src/query-watchers');
    const modules = await listModulesInsideFolder(dir);

    const out = new TypescriptWriter();

    out.import_('{ Snapshot }', '../framework')
    for (const moduleName of modules)
        out.import_(moduleName, `./${moduleName}`);

    out.blankLine()

    out.openBlock("export mountEveryQueryWatcher(snapshot: Snapshot) {")
    for (const moduleName of modules)
        out.line(`snapshot.mountQueryWatcher('${moduleName}', ${toIdentifier(moduleName)})`)

    out.closeBlock()
}
