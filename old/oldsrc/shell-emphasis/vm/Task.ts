
import { Scope } from '../Scope'
import VMEffect from './VMEffect'

export default interface Task {
    id: string
    scope: Scope
    done?: boolean
    error?: any
    result?: any
}
