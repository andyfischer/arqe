
import CommandExecutionParams from '../CommandParams'
import QueryContext from '../QueryContext';

export default function envCommand(params: CommandExecutionParams) {
    const { tuple, output, scope } = params;

    const parent = scope.parent;

    if (!parent.env) {
        parent.env = tuple;
    } else {
        for (const tag of tuple.tags) {
            parent.env = parent.env.setVal(tag.attr, tag.value);
        }
    }
    
    output.done();
}
