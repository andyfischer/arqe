
import Tuple from '../Tuple'
import Stream from '../Stream'
import TableInterface, { GenericStream } from '../TableInterface'
import Fs from 'fs-extra'

export class FsFileContents implements TableInterface {
    name: 'FsFileContents'
    supportsScan: false

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

    scan(out: GenericStream<{slotId: string, tuple: Tuple}>) {
        throw new Error("can't scan FsFileContents");
    }

    async insert(tuple: Tuple, out: Stream) {
        const filename = tuple.getVal("filename");
        const contents = tuple.getVal("file-contents");
        await Fs.writeFile(filename, 'utf8');
        out.done();
    }

    async update(slotId: string, tuple: Tuple, out: Stream) {
        await this.insert(tuple, out);
    }

    delete(slotId: string, out: Stream) {
    }
}
