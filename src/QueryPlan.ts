
import Tuple from './Tuple'
import PatternTag from './PatternTag'
import Stream from './Stream'
import Schema, { Column, ColumnType } from './Schema'
import TableMount from './TableMount'
import TupleModification from './TupleModification'

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
    isDelete?: boolean
    initializeIfMissing: boolean
    modification: TupleModification

    tuple: Tuple
    filterPattern: Tuple
    output: Stream

    table?: TableMount
    tableName?: string
    searchTables?: TableMount[]

    failed: boolean
}
