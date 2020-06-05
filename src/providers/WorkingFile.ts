
import IDSource from '../utils/IDSource'
import ProviderAPI from './generated/WorkingFilesProviderAPI'
import Fs from 'fs-extra'

class File {
    filename: string
    lines: string[]
}

export default function setup() {

    const ids = new IDSource();
    const openFiles: { [id: string]: File } = {}
    
    return new ProviderAPI({
        async loadFile(filename: string) {

            const id = ids.take();

            const contents = await Fs.readFile(filename, 'utf8');
            const file = new File()
            file.filename = filename;
            file.lines = contents.split('\n');
            openFiles[id] = file;

            return {
                id,
                filename
            }
        },
        getLine(id: string, lineno: string) {
            const index = parseInt(lineno) - 1;
            return openFiles[id].lines[index];
        },
        setLine(id: string, lineno: string, text: string) {
            const index = parseInt(lineno) - 1;
            openFiles[id].lines[index] = text;
        },
        async commitFile(id: string) {
            const file = openFiles[id];

            await Fs.writeFile(file.filename, file.lines.join('\n'));

            delete openFiles[id];
        }
    });
}
