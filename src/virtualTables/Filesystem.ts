
import Tuple from '../Tuple'
import Stream from '../Stream'
import TableInterface, { } from '../TableInterface'
import GenericStream, { StreamCombine } from '../GenericStream'
import fs from 'fs-extra'
import { emitCommandError } from '../CommandMeta'
import { handles } from '../decorators'
import TuplePatternMatcher from '../TuplePatternMatcher'
import NativeHandler from '../NativeHandler'

export class FsFileContents {
    name = 'FsFileContents'
    supportsCompleteScan: false
    schema = 'fs filename file-contents?'

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

export class FsDirectory implements TableInterface {
    name = 'FsDirectory'
    schema = 'fs dir filename?'
    supportsCompleteScan: false

    async select(pattern: Tuple, out: Stream) {
        const dir = pattern.getVal("dir");
        const files = await fs.readdir(dir, (error, files) => {
            if (error) {
                emitCommandError(out, error);
            } else {
                for (const file of files)
                    out.next(pattern.setVal("filename", file));
            }
            out.done();
        });
    }

    async insert(tuple: Tuple, out: Stream) {
    }
    
    delete(search: Tuple, out: Stream) {
        throw new Error("FsDirectory delete not supported");
    }
}
