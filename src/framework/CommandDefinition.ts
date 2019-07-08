
import { CommandContext } from '.'

export default interface CommandDefinition {
    name: string
    run: (context: CommandContext) => Promise<void>
}
