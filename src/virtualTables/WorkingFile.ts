
import Stream from '../Stream'
import TableInterface, { Handler } from '../TableInterface'
import Tuple from '../Tuple'
import TupleModification from '../TupleModification'
import TuplePatternMatcher from '../TuplePatternMatcher'
import { parsePattern } from '../parseCommand'
import { handles } from '../annotations'

interface File {
    id: string
    filename: string
    contents: string
}

export class WorkingFile implements TableInterface {
    name = 'WorkingFile'
    supportsCompleteScan = true
    schema = 'working-file filename? contents?'

    byId = new Map<string, File>();
    byFilename = new Map<string, File>();

    constructor() {
        /*
        this.handlers.add(parsePattern('get working-file/$id filename? contents?'),
                          (tuple, out) => this.findById(tuple, out));
        this.handlers.add(parsePattern('get working-file filename/$x contents?'),
                          (tuple, out) => this.findById(tuple, out));
        this.handlers.add(parsePattern('insert working-file/$x filename/$y contents/$z'),
                          (tuple, out) => this.insertNew(tuple, out));
                          */
    }

    @handles("get working-file/$id filename? contents?")
    findById(tuple: Tuple, out: Stream) {
        const found = this.byId.get(tuple.getVal('working-file'));
        if (found) {
            out.next(tuple.setVal('filename', found.filename).setVal('contents', found.contents));
        }
        out.done();
    }

    findByFilename(tuple: Tuple, out: Stream) {
        const found = this.byFilename.get(tuple.getVal('filename'));
        if (found) {
            out.next(tuple.setVal('working-file', found.id).setVal('contents', found.contents));
        }
        out.done();
    }

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
}
