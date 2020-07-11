
import TableStorage, { } from '../TableStorage'
import fs from 'fs-extra'
import { handles } from '../decorators'

export class FsFileContents {
    name = 'FsFileContents'
    supportsCompleteScan: false
    schemaStr = 'fs filename file-contents?'

    @handles("get fs filename/$x file-contents/*")
    async loadFile({ filename }) {
        return {
            'file-contents': await fs.readFile(filename, 'utf8')
        }
    }

    @handles("insert fs filename/$x file-contents/$y")
    async saveFile({ filename, 'file-contents': contents }) {
        await fs.writeFile(filename, contents);
    }

    @handles("delete fs filename/$x")
    async delete({ filename }) {
        await fs.unlink(filename);
    }
}

export class FsDirectory implements TableStorage {
    name = 'FsDirectory'
    schemaStr = 'fs dir filename?'
    supportsCompleteScan: false

    @handles("get fs dir/$d filename")
    async list({ dir }) {
        const files = await fs.readdir(dir);
        return files.map(filename => ({ filename }))
    }
}
