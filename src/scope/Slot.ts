
const MissingValue = Symbol('missing');

type PatchType = 'override'

export default class ScopeValue {
    current: any

    patch?: PatchType
}
