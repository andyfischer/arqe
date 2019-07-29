
import { CommandContext } from '.'
import { Query } from '../query'

export type CommandImplementation = (query: Query) => void

export default interface CommandDefinition {
    name: string
    run: CommandImplementation
}
