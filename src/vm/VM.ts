
import { parseSingleLine } from '../parse-query'
import { SimpleExpr } from '../parse-query/parseQueryV3'
import { CommandDefinition } from '../types/CommandDatabase'
import CommandImplementation from './CommandImplementation'
import CommandContext, { simpleExprToCommandContext } from './CommandContext'
import { RichValue } from '../rich-values'

export default class VM {

    scope: any = {}
    nextExecId: number = 1
    
    lookupCommand?: (s: string) => CommandImplementation
    onResult?: (execId: number, result: RichValue) => void

    executeSimple(expr: SimpleExpr) {

        const execId = this.nextExecId;
        this.nextExecId += 1;

        const context = simpleExprToCommandContext(this, expr);
        const commandName = context.positionals[0];

        if (!commandName)
            throw new Error('no command name found: ' + expr.originalStr);

        const implementation = this.lookupCommand(commandName);
        if (!implementation)
            throw new Error('command not found: ' + commandName);

        implementation(context)
        return execId;
    }

    handleCommandResponse(execId: number, val: RichValue) {
        this.onResult(execId, val);
    }

    executeQueryString(query: string, options: {}) {
        parseSingleLine({
            text: query,
            onExpr: (expr) => {
                if (expr.type === 'simple')
                    this.executeSimple(expr as SimpleExpr)
            }
        });
    }
}
