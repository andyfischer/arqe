
import { CommandContext } from '.'

export type CommandHandler = (context: CommandContext) => Promise<void>

export default interface CommandDefinition {
    name: string
    run: CommandHandler
}
