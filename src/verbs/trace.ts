import QueryContext from '../QueryContext'
import CommandExecutionParams from '../CommandParams'


export default function traceCommand(cxt: QueryContext, params: CommandExecutionParams) {
    cxt.traceEnabled = true;
    params.output.done();
}
