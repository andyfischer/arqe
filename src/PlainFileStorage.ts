
import StorageProvider from './StorageProvider'
import RelationPattern from './RelationPattern'
import Command from './Command'
import SetOperation from './SetOperation'
import Relation from './Relation'
import { FixedTag } from './RelationPattern'
import RelationSearch from './RelationSearch'
import { normalizeExactTag } from './stringifyQuery'

import Util from 'util'
import Fs from 'fs'
import Path from 'path'

const readFile = Util.promisify(Fs.readFile);
const readDir = Util.promisify(Fs.readdir);
const writeFile = Util.promisify(Fs.writeFile);

export default class PlainFileStorage implements StorageProvider {
    filenameType: 'filename'
    directory: string

    async runSearch(search: RelationSearch) {
        const { pattern } = search;
        const tag = pattern.getOneTagForType(this.filenameType);

        if (tag.starValue) {
            // Directory listing
            const files = await readDir(this.directory);
            for (const filename of files) {
                const tags: FixedTag[] = pattern.fixedTags.concat([{
                    tagType: this.filenameType,
                    tagValue: filename
                }]);
                const rel = new Relation(tags, null);
                rel.payloadUnavailable = true;
                search.relation(rel);
            }

        } else {
            // File contents
            const filename = tag.tagValue;
            const fullFilename = Path.join(this.directory, filename);
            const contents = await readFile(fullFilename, 'utf8');

            const rel = new Relation(pattern.fixedTags, contents);
            search.relation(rel);
        }

        search.finish();
    }
    async runSave(set: SetOperation) {
        set.saveFinished(null);
    }
}
