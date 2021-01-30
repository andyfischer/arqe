import CommandExecutionParams from '../CommandParams'
import Tuple from '../Tuple'

export default function dropCommand(params: CommandExecutionParams) {
    const { tuple, input, output, scope } = params;

    input
    .map((t:Tuple) => {
        for (const tag of tuple.tags) {
            t = t.drop(tag.attr);
        }
        return t;
    }, 'drop')
    .sendTo(output);
}
