
import StorageProvider from './StorageProvider'
import RelationPattern from './RelationPattern'
import Command from './Command'
import GetOperation from './GetOperation'
import SetOperation from './SetOperation'
import Relation, { RelationTag } from './Relation'
import { normalizeExactTag } from './stringifyQuery'

import Util from 'util'
import Fs from 'fs'

const readFile = Util.promisify(Fs.readFile);
const readDir = Util.promisify(Fs.readdir);
const writeFile = Util.promisify(Fs.writeFile);

export default class PlainFileStorage implements StorageProvider {
    filenameType: 'filename'
    directoryMount: string

    async runSearch(get: GetOperation) {
        const { pattern } = get;
        const tag = pattern.getOneTagForType(this.filenameType);

        if (tag.starValue) {
            // Directory listing
            const files = await readDir(this.directoryMount);
            for (const filename of files) {
                const tags: RelationTag[] = pattern.fixedTags.concat([{
                    tagType: this.filenameType,
                    tagValue: filename
                }]);
                const ntag = normalizeExactTag(tags);
                const rel = new Relation(ntag, tags, null);
                rel.payloadUnavailable = true;
                get.foundRelation(rel);
            }

        } else {
            // File contents
            const filename = tag.tagValue;
            const contents = await readFile(filename, 'utf8');

            const ntag = normalizeExactTag(pattern.tags);
            const rel = new Relation(ntag, pattern.fixedTags, contents);
            get.foundRelation(rel);
        }
        get.finishSearch();
    }
    async runSave(set: SetOperation) {
        set.saveFinished(null);
    }
}
