
import Graph from '../Graph'
import FilesystemAPI from './generated/FilesystemAPI'
import Fs from 'fs-extra'

export default function init() {
    return new FilesystemAPI({
        async readFile(filename: string) {
            return await Fs.readFile(filename, 'utf8');
        },
        async writeFile(filename: string, contents: string) {
            await Fs.writeFile(filename, contents);
        }
    });
}
