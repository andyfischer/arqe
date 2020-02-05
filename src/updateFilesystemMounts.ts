
import UpdateContext, { UpdateFn } from './UpdateContext'
import StorageMount from './StorageMount'
import PlainFileStorage from './PlainFileStorage'
import RelationPattern, { commandToRelationPattern } from './RelationPattern'

export default function updateFilesystemMounts(cxt: UpdateContext): StorageMount[] {

    const result = [];
    const mounts = cxt.getRelations('filesystem-mount/*');

    for (const mount of mounts) {
        const options: any = {};

        const mountKey = mount.getTag("filesystem-mount");
        
        for (const option of cxt.getRelations(`${mountKey} option/*`)) {
            options[option.getTagValue("option") as string] = option.payload();
        }

        options.filenameType = options.filenameType || 'filename'

        if (!options.directory)
            continue;

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
