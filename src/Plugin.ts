
import Command from './Command'

export default interface Plugin {
    name: string
    set: (command: Command) => string
    get: (command: Command) => string
    deleteCmd: (command: Command) => string
}
