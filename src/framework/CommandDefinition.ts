
import { Query } from '..'

export type CommandImplementation = (query: Query) => void

export default interface CommandDefinition {
    name: string
    run: CommandImplementation
}
