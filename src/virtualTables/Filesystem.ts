
import fs from 'fs-extra'
import { handles } from '../decorators'
import { decoratedObjToTableMount } from '../TableMount'

import globLib from 'glob'

export class FsFileContents {
    name = 'FsFileContents'
    schemaStr = 'fs filename file-contents?'

    @handles("get fs filename/$x file-contents/*")
    async loadFile({ filename }) {
        return {
            'file-contents': await fs.readFile(filename, 'utf8')
        }
    }

    @handles("insert fs filename/$x file-contents/$y")
    async saveFile({ filename, 'file-contents': contents }) {
        await fs.writeFile(filename, contents);
    }

    @handles("delete fs filename/$x")
    async delete({ filename }) {
        await fs.unlink(filename);
    }
}


export class FsDirectory {
    name = 'FsDirectory'
    schemaStr = 'fs dir filename?'

    @handles("get fs dir/$d filename")
    async list({ dir }) {
        const files = await fs.readdir(dir);
        return files.map(filename => ({ filename }))
    }
}

export class Glob {
    name = 'Glob'
    schemaStr = 'glob pattern filename?'

    @handles("get glob pattern/$p filename")
    globSearch({ pattern }) {
        return new Promise((resolve, reject) => {
            globLib(pattern, {}, (err, files) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(files.map(filename => ({filename})));
                }
            });
        })
    }
}

export function fsFileContents() {
    return decoratedObjToTableMount(new FsFileContents());
}

export function fsDirectory() {
    return decoratedObjToTableMount(new FsDirectory());
}

export function glob() {
    return decoratedObjToTableMount(new Glob());
}