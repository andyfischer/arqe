
import Tuple from '../Tuple'
import Stream from '../Stream'
import TableInterface, { TupleModifier } from '../TableInterface'
import GenericStream, { StreamCombine } from '../GenericStream'
import Fs from 'fs-extra'

export class FsFileContents implements TableInterface {
    name: 'FsFileContents'
    supportsScan: false
    schema = 'fs filename file-contents?'

    async search(pattern: Tuple, out: Stream) {
        const tag = pattern.getTagObject("filename");
        if (tag.starValue)
            throw new Error("can't search filename/*");

        if (!tag.tagValue)
            throw new Error("missing concrete value for filename/");

        const filename = tag.tagValue;
        out.next(pattern.setVal("file-contents", await Fs.readFile(filename, 'utf8')));
        out.done();
    }

    async insert(tuple: Tuple, out: Stream) {
        const filename = tuple.getVal("filename");
        const contents = tuple.getVal("file-contents");
        await Fs.writeFile(filename, 'utf8');
        out.done();
    }

    async updatev2(search: Tuple, modifier: TupleModifier, out: Stream) {
        throw new Error("FsFile update not supported yet");
    }

    deletev2(search: Tuple, out: Stream) {
        throw new Error("FsDirectory delete not supported yet");
    }
}

export class FsDirectory implements TableInterface {
    name: 'FsDirectory'
    schema = 'fs dir filename?'
    supportsScan: false

    async search(pattern: Tuple, out: Stream) {
    }

    async insert(tuple: Tuple, out: Stream) {
    }
    
    async updatev2(search: Tuple, modifier: TupleModifier, out: Stream) {
        throw new Error("FsDirectory update not supported yet");
    }

    deletev2(search: Tuple, out: Stream) {
        throw new Error("FsDirectory delete not supported");
    }
}
