
import fs from 'fs-extra'

import globLib from 'glob'
import setupTableSet from '../setupTableSet'
import { unwrapTuple } from '../tuple/UnwrapTupleCallback'

export function setupTables() {
    return setupTableSet({
        'fs filename file-contents?': {
            name: 'FsFile',
            "find-with filename": unwrapTuple(async ({ filename }) => {
                return {
                    'file-contents': await fs.readFile(filename, 'utf8')
                }
            }),
            "insert filename file-contents": unwrapTuple(async ({ filename, 'file-contents': contents }) => {
                await fs.writeFile(filename, contents);
            }),
            "delete filename": unwrapTuple(async ({ filename }) => {
                await fs.unlink(filename);
            })
        },
        'fs dir filename?': {
            name: 'FsDirectory',
            'find-with dir': unwrapTuple(async ({ dir }) => {
                const files = await fs.readdir(dir);
                return files.map(filename => ({ filename }))
            })
        },
        'glob pattern filename?': {
            name: 'Glob',
            'find-with pattern': unwrapTuple(({ pattern }) => {
                return new Promise((resolve, reject) => {
                    globLib(pattern, {}, (err, files) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(files.map(filename => ({filename})));
                        }
                    });
                })
            })
        }
    });
}