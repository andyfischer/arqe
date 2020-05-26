
import ColumnType, { ValueColumn } from './ColumnType'
import StorageProviderV3 from './StorageProviderV3'

export default class Column {
    name: string
    type: ColumnType = ValueColumn

    storageProvider?: StorageProviderV3

    constructor(name: string) {
        this.name = name;
    }
}
