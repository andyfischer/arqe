
import UpdateContext, { UpdateFn } from './UpdateContext'
import StorageMount from './StorageMount'
import PlainFileStorage from './PlainFileStorage'
import RelationPattern, { commandToRelationPattern } from './RelationPattern'

export default function updateFilesystemMounts(cxt: UpdateContext): StorageMount[] {

    const result = [];
    for (const mount of cxt.getRelations('filesystem-mount/*')) {

        const mountKey = mount.getTagString("filesystem-mount");
        
        const options = cxt.getOptionsObject(mountKey);

        if (!options.directory)
            continue;

        options.filenameType = options.filenameType || 'filename';

        const storage = new PlainFileStorage();
        storage.filenameType = options.filenameType;
        storage.directory = options.directory;

        result.push({
            pattern: commandToRelationPattern(`get ${mountKey} filename/*`),
            storage
        });
    }

    return result;
}
