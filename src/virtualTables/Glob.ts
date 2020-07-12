
import Tuple from '../Tuple'
import Stream from '../Stream'
import GenericStream, { StreamCombine } from '../GenericStream'
import fs from 'fs'
import { emitCommandError } from '../CommandMeta'
import globLib from 'glob'
import { handles } from '../decorators'

export class Glob {
    name = 'Glob'
    supportsCompleteScan: false
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
