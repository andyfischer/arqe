
import Tuple from '../Tuple'
import Stream from '../Stream'
import TableInterface, { } from '../TableInterface'
import GenericStream, { StreamCombine } from '../GenericStream'
import fs from 'fs'
import { emitCommandError } from '../CommandMeta'

export class FsFileContents implements TableInterface {
    name = 'FsFileContents'
    supportsCompleteScan: false
    schema = 'fs filename file-contents?'

    search(pattern: Tuple, out: Stream) {
        const tag = pattern.getTagObject("filename");
        if (!tag.fixedValue())
            throw new Error("filename must be a fixed value");

        const filename = tag.tagValue;

        fs.readFile(filename, 'utf8', (error, contents) => {
            if (error)
                emitCommandError(out, error);
            else
                out.next(pattern.setVal("file-contents", contents));

            out.done();
        });
    }

    insert(tuple: Tuple, out: Stream) {
        const filename = tuple.getVal("filename");
        const contents = tuple.getVal("file-contents");
        fs.writeFile(filename, 'utf8', (error) => {
            if (error)
                emitCommandError(out, error);
            out.done();
        });
    }

    delete(search: Tuple, out: Stream) {
        const filename = search.getVal("filename");

        fs.unlink(filename, (error) => {
            if (error)
                emitCommandError(out, error);
            out.done();
        });
    }
}

export class FsDirectory implements TableInterface {
    name = 'FsDirectory'
    schema = 'fs dir filename?'
    supportsCompleteScan: false

    async search(pattern: Tuple, out: Stream) {
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
