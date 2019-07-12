
import { ReducerDefinition } from '.'

export const everyReducer: ReducerDefinition<any>[] = []

export default function declareReducer(def: ReducerDefinition<any>) {
    everyReducer.push(def);
    return def;
}
