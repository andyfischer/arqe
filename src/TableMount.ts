
import Tuple from './Tuple'
import TableStorage from './TableInterface'
import TableListener from './TableListener'

export default class TableMount {
    name: string
    schema: Tuple
    storage: TableStorage

    constructor(name: string, schema: Tuple, storage: TableStorage) {
        this.name = name;
        this.schema = schema;
        this.storage = storage;
    }
}
