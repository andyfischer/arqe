import QueryContext from '../QueryContext'
import CommandParams from '../CommandParams'

export default function traceCommand(params: CommandParams) {
    const { scope } = params;
    scope.traceEnabled = true;
    params.output.done();
}
