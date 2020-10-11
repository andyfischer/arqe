
import CommandExecutionParams from '../CommandParams'
import QueryContext from '../QueryContext';

export default function envCommand(cxt: QueryContext, params: CommandExecutionParams) {
    const { tuple, output } = params;

    const parent = cxt.parent;

    if (!parent.env) {
        parent.env = tuple;
    } else {
        for (const tag of tuple.tags) {
            parent.env = parent.env.setVal(tag.attr, tag.value);
        }
    }
    
    output.done();
}
