#! /usr/bin/env node

import Fs from 'fs-extra'
import Path from 'path'
import Crypto from 'crypto'
import { implement, Query } from '..'
import { print, values, allTrue } from '../utils'
import { Snapshot } from '../framework'

const selfCheck = true;

function getSha1(data) {
    return Crypto.createHash("sha1").update(data).digest("hex");
}

function getFiletype(filename: string, contents: Buffer) {
    if (filename.endsWith('.sh'))
        return 'bash-script'

    const str = contents.toString('utf8')

    const usrBin = /\#\! *\/usr\/bin\/env +([a-z]*)/.exec(str);

    switch (usrBin && usrBin[1]) {
    case 'bash':
        return 'bash-script';
    }

    return 'unknown'
}

export default function(snapshot: Snapshot) {
    implement('encode-file', async (query: Query) => {
        const files = process.argv.slice(2);

        if (files.length === 0) {
            print('error: no file?')
            return;
        }

        for (const file of files) {
            const basename = Path.basename(file);
            const contents = await Fs.readFile(file);
            const base64 = contents.toString('base64');
            const sha1 = getSha1(contents);
            const filetype = getFiletype(basename, contents);
            const cmd = `file-contents filename=${basename} filetype=${filetype} sha1=${sha1} base64=${base64}`
            print(cmd);

            /*
            if (selfCheck) {
                const parsed = parseQueries(cmd);
                const options = parsed[0].options;

                const matches = {
                    filename: basename === options.filename,
                    filetype: filetype === options.filetype,
                    sha1: sha1 === options.sha1,
                    base64: base64 === options.base64
                }

                if (!allTrue(values(matches))) {
                    print(`error: self check failed\n  operation: encode-file\n`
                          +`  command: ${cmd}\n  matches: ${JSON.stringify(matches)}`);
                }
            }*/
        }
    });
}
