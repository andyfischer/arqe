
import fs from 'fs-extra'
import TableDefiner from '../TableDefiner'
import globLib from 'glob'
import { unwrapTuple } from '../tuple/UnwrapTupleCallback'

async function callGlob(pattern: string, options): Promise<{filename: string}[]> {
    return new Promise((resolve, reject) => {
        globLib(pattern, options, (err, files) => {
            if (err) {
                reject(err);
            } else {
                resolve(files.map(filename => ({filename})));
            }
        });
    })
}

export default (definer: TableDefiner) =>
    definer.provide('fs filename file-contents? mtime?', {
        name: 'FsFile',
        "find filename": async (input, out) => {
            const filename = input.get('filename');
            const found = { }

            if (input.hasAttr('file-contents'))
                found['file-contents'] = await fs.readFile(filename, 'utf8');

            if (input.hasAttr('mtime')) {
                found['mtime'] = (await fs.stat(filename)).mtime.getTime()
            }

            out.done(found);
        },
        "insert filename file-contents": unwrapTuple(async ({ filename, 'file-contents': contents }) => {
            await fs.writeFile(filename, contents);
        }),
        "delete filename": unwrapTuple(async ({ filename }) => {
            await fs.unlink(filename);
        })
    })
    .provide('fs dir filename?', {
        name: 'FsDirectory',
        'find dir': unwrapTuple(async ({ dir }) => {
            const files = await fs.readdir(dir);
            return files.map(filename => ({ filename }))
        })
    })
    .provide('glob pattern cwd? filename?', {
        name: 'Glob',
        'find pattern cwd': async (input, out) => {
            const { pattern, cwd } = input.obj();
            const results = await callGlob(pattern, { cwd });
            out.done(results);
        },
        'find pattern': async (input, out) => {
            const { pattern } = input.obj();
            const results = await callGlob(pattern, {});
            out.done(results);
        }
    })
