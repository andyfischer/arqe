
import Fs from 'fs-extra'
import Path from 'path'
import { print } from '../utils'
import FileStore from './FileStore'

export { default as Event } from './Event'
export { default as Store } from './Store'

let mainStore: FileStore;

export async function fileStoreExists(dir) {
    
    return true;
}

export async function setupFileStore(dir): Promise<FileStore> {
    console.log('setupFileStore: ', dir);
    mainStore = new FileStore(dir);

    if (!await mainStore.filesExist()) {
        if (await Fs.exists(dir)) {
            throw new Error('setupFileStore failed, directory already exists: ' + dir);
        }

        await mainStore.initializeFiles();
    }

    return mainStore;
}

export async function saveEvent(event) {
    await mainStore.saveEvent(event);
}

export default () => mainStore;
