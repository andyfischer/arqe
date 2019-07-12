
import { Query } from '../query'
import { Snapshot } from '../snapshot'
import { ReducerDefinition } from '.'

export default interface LiveReducer<ValueT = any> {
    name: string
    value: ValueT
    reducer: (query: Query, currentValue: ValueT, snapshot?: Snapshot) => ValueT
    spamsChangeLog?: boolean
}

export type ReducerDefinition<T> = () => LiveReducer<T>
