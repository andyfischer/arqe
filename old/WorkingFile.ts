
/*
import Stream from '../Stream'
import Tuple from '../Tuple'
import { handles } from '../decorators'

interface File {
    id: string
    filename: string
    contents: string
}

export class WorkingFile {
    name = 'WorkingFile'
    supportsCompleteScan = false
    schemaStr = 'working-file filename? contents?'

    byId = new Map<string, File>();
    byFilename = new Map<string, File>();

    @handles("get working-file/$id filename? contents?")
    findById(tuple: Tuple, out: Stream) {
        const found = this.byId.get(tuple.getVal('working-file'));
        if (found) {
            out.next(tuple.setVal('filename', found.filename).setVal('contents', found.contents));
        }
        out.done();
    }

    @handles("get working-file? filename/$x contents?")
    findByFilename(tuple: Tuple, out: Stream) {
        const found = this.byFilename.get(tuple.getVal('filename'));
        if (found) {
            out.next(tuple.setVal('working-file', found.id).setVal('contents', found.contents));
        }
        out.done();
    }

    @handles("insert working-file filename contents")
    insertNew(tuple: Tuple, out: Stream) {
        const filename = tuple.getVal('filename');
        const id = tuple.getVal('working-file');
        const contents = tuple.getVal('contents');

        const file: File = {
            filename,
            id,
            contents
        };

        this.byId.set(id, file);
        this.byFilename.set(filename, file);
    }

    @handles("update working-file/$x contents/(set $y)")
    updateContents(tuple: Tuple, out: Stream) {
        const id = tuple.getVal('working-file');
        const contents = tuple.getVal('contents');
        const file = this.byId.get(id);
        file.contents = contents;
    }
}
*/
