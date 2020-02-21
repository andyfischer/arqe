
import StorageProvider from './StorageProvider'
import SetOperation from './SetOperation'
import RelationPattern from './RelationPattern'
import RelationSearch from './RelationSearch'
import UpdateContext from './UpdateContext'

type DeriveFunc = (cxt: UpdateContext, rel: RelationPattern) => any

export default class DerivedValueMount implements StorageProvider {

    mountTypename: string
    callback: DeriveFunc

    constructor(callback: DeriveFunc, mountTypename) {
        this.mountTypename = mountTypename;
        this.callback = callback;
    }

    async runSearch(search: RelationSearch) {
        /*
        const subSearch: RelationSearch = {
            search.pattern.removeType(this.mountType)
        }
        */
    }

    async runSave(set: SetOperation) {
        throw new Error("can't save on a derived value");
    }
}
