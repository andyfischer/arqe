
import IDSource from '../utils/IDSource'
import ProviderAPI from './generated/WorkingFilesProviderAPI'
import Fs from 'fs-extra'

export default function setup() {

    const ids = new IDSource();
    const stored = {};
    
    return new ProviderAPI({
        async loadFile(filename: string) {

            const id = ids.take();

            const contents = await Fs.readFile(filename, 'utf8');
            stored[id] = contents;

            return {
                id,
                filename
            }
        },
        fileContents(id: string) {
            return ""
        },
        commitFile(id: string) {
        }
    });
}
