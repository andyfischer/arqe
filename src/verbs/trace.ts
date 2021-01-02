import QueryContext from '../QueryContext'
import CommandExecutionParams from '../CommandParams'


export default function traceCommand(params: CommandExecutionParams) {
    const { scope } = params;
    scope.traceEnabled = true;
    params.output.done();
}
