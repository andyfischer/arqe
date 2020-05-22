
import Pattern from './Pattern'
import PatternTag from './PatternTag'
import RelationReceiver from './RelationReceiver'
import { AttributeSet } from './Database'
import Schema, { Column, ColumnType } from './Schema'

export interface QueryTag {
    type: ColumnType
    column: Column
    tag: PatternTag
}

export default interface QueryPlan {
    tags: QueryTag[]
    views: QueryTag[]
    objects: QueryTag[]
    values: QueryTag[]

    singleStar: boolean
    doubleStar: boolean

    pattern: Pattern
    output: RelationReceiver

    modifiesExisting: boolean
    initializeIfMissing: boolean

    attributeSet?: AttributeSet
}
