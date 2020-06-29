
import Tuple from './Tuple'
import PatternTag from './PatternTag'
import Stream from './Stream'
import Schema, { Column, ColumnType } from './Schema'
import StorageProvider from './StorageProvider'
import TableMount from './TableMount'

export interface QueryTag {
    type: ColumnType
    column: Column
    tag: PatternTag
}

export default interface QueryPlan {
    tags: QueryTag[]

    singleStar: boolean
    doubleStar: boolean
    isUpdate: boolean
    initializeIfMissing: boolean
    isDelete?: boolean
    modificationCallback?: (tuple: Tuple) => Tuple

    tuple: Tuple
    filterPattern: Tuple
    output: Stream
    storageProvider?: StorageProvider

    table?: TableMount
    tableName?: string
    searchTables?: TableMount[]

    failed: boolean
}
