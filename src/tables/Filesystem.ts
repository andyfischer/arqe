
import fs from 'fs-extra'

import globLib from 'glob'
import { unwrapTuple } from '../tuple/UnwrapTupleCallback'

async function callGlob(pattern: string, options): Promise<{filename: string}[]> {
    return new Promise((resolve, reject) => {
        // console.log('calling globLib', pattern, JSON.stringify(options))
        globLib(pattern, options, (err, files) => {
            // console.log('globLib returned: ' + files)
            if (err) {
                reject(err);
            } else {
                resolve(files.map(filename => ({filename})));
            }
        });
    })
}

export default function getDef() {
    return {
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
        'glob pattern cwd? filename?': {
            name: 'Glob',
            'find-with pattern cwd': unwrapTuple(({ pattern, cwd }) => {
                if (!pattern)
                    throw new Error('missing pattern')
                return callGlob(pattern, { cwd });
            }),
            'find-with pattern': unwrapTuple(({ pattern }) => {
                if (!pattern)
                    throw new Error('missing pattern')
                return callGlob(pattern, {});
            })
        }
    };
}
