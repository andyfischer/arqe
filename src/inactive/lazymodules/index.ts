
/*
import Path from 'path'
import { print } from '../utils'

const _loaded:{[filename:string]: any} = {}

export async function ensureModuleLoaded(filename: string) {
    const absFilename = Path.resolve(Path.join(__dirname, '../..', filename));

    if (_loaded[absFilename])
        return;

    print('note: loading lazy module: ' + filename);

    _loaded[absFilename] = require(absFilename);
}
*/
