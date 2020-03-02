
const MissingValue = Symbol('missing');

type PatchType = 'override'

export default class ScopeValue {
    value: any
    empty: boolean

    patch?: PatchType
}
