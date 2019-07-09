
import DocumentMount from './DocumentMount'
import { print } from '../utils'
import applyQuery from './applyQuery'
import everyDocument from '../reducers/_everyDocument'
import { CommandDatabase } from '../reducers/commandDatabase'

export default class Snapshot {

    liveValues: { [name: string]: any } = {}
    liveDocuments: DocumentMount[] = []
    liveDocumentsByName: { [name: string]: DocumentMount } = {}

    constructor() {
        // Builtin documents
        for (const doc of everyDocument)
            this.mountDocument(doc());
    }

    mountDocument(mount: DocumentMount) {
        if (!mount.name)
            throw new Error('missing name');

        if (this.liveDocumentsByName[mount.name])
            throw new Error('already have a mount with name: ' + mount.name);

        this.liveDocuments.push(mount);
        this.liveDocumentsByName[mount.name] = mount;

        return mount;
    }

    // ParseContext
    isRelation(s: string) {
        const relations = this.getValue('relations');
        return !!relations[s];
    }

    isCommand(s: string) {
        const db: CommandDatabase = this.getValue('commandDB');
        return !!db.byName[s];
    }

    getLastIncompleteClause() {
        return this.getValueOpt('lastIncompleteClause').found;
    }
    // end ParseContext

    hasDocument(documentName: string) {
        const doc = this.liveDocumentsByName[documentName];
        return !!doc;
    }

    getValueOpt(name: string) {
        if (this.liveValues[name])
            return { found: this.liveValues[name] }

        const doc = this.liveDocumentsByName[name];
        if (doc)
            return { found: doc.value }

        return {};
    }

    getValue(name: string) {
        const get = this.getValueOpt(name);

        if (!get.found)
            throw new Error('value not found for: ' + name);

        return get.found;
    }

    async applyQuery(queryString: string) {
        return await applyQuery(this, queryString);
    }
}
