
import { Snapshot, Query } from '..'

import newFuncImpl from './new-func-impl'

export default function implementAll(snapshot: Snapshot) {
    newFuncImpl(snapshot);
}
