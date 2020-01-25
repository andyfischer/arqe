
import Fs from 'fs-extra'
import StoragePlugin from './StoragePlugin'
import SetOperation from './SetOperation'
import GetOperation from './GetOperation'

export default class FilesystemStorage implements StoragePlugin {
    async setAsync(set: SetOperation) {
        const { filename } = set.relation.asMap;
        const contents = set.command.payloadStr;

        try {
            // console.log('saving file: ', filename, ' -- ', contents);
            await Fs.writeFile(filename, contents);
        } catch (err) {
            set.respond('#error ' + err);
            set.needsReply = false;
        }
    }

    async getAsync(get: GetOperation) {
        /*
        const { filename } = get.relation.asMap;

        try {
            const contents = await Fs.readFile(filename, 'utf8');
            get.respond(contents);
            // get.needsReply = false;
        } catch (err) {
            get.respond('#error ' + err);
            // get.needsReply = false;
        }
        */
    }
}