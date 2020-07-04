
import Tuple from '../Tuple'
import Stream from '../Stream'
import TableInterface, { } from '../TableInterface'
import GenericStream, { StreamCombine } from '../GenericStream'
import fs from 'fs'
import { emitCommandError } from '../CommandMeta'
import globLib from 'glob'

export class Glob implements TableInterface {
    name = 'Glob'
    supportsCompleteScan: false
    schema = 'glob pattern filename?'

    select(pattern: Tuple, out: Stream) {

        const globPattern = pattern.getTagObject('pattern');
        if (!globPattern.fixedValue())
            throw new Error(`'pattern' must be fixed`);

        const globPatternStr = globPattern.tagValue;

        globLib(globPatternStr, {}, (err, files) => {
            if (err) {
                emitCommandError(out, err);
            } else {
                for (const file of files) {
                    out.next(pattern.setVal("filename", file));
                }
            }
            out.done();
        });
    }
    insert(pattern: Tuple, out: Stream) {
        throw new Error(`can't insert on glob`);
    }
    delete(pattern: Tuple, out: Stream) {
        throw new Error(`can't delete on glob`);
    }
}
