
import Tuple from './Tuple'
import TableInterface from './TableInterface'
import TableListener from './TableListener'

export default class TableMount {
    name: string
    schema: Tuple
    storage: TableInterface

    constructor(name: string, schema: Tuple, storage: TableInterface) {
        this.name = name;
        this.schema = schema;
        this.storage = storage;
    }
}