
import Graph from '../Graph'
import FilesystemAPI from './generated/FilesystemAPI'
import Fs from 'fs-extra'
import Glob from 'glob'

export default function init() {
    return new FilesystemAPI({
        async readFile(filename: string) {
            return await Fs.readFile(filename, 'utf8');
        },
        async writeFile(filename: string, contents: string) {
            await Fs.writeFile(filename, contents);
        },
        async readDir(dir: string) {
            return await Fs.readdir(dir);
        },
        async listMatchingFiles(match: string) {

            return new Promise((resolve, reject) => {
                Glob(match, {}, (err, files) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(files);
                    }
                });
            });
        }
    });
}
