import { Query } from '..';
export default interface LiveReducer<ValueT = any> {
    name: string;
    value: ValueT;
    reducer: (query: Query, currentValue: ValueT) => ValueT;
    spamsChangeLog?: boolean;
}
export declare type ReducerDefinition<T> = () => LiveReducer<T>;
