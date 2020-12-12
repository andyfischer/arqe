
import CommandExecutionParams from '../CommandParams'
import { objectToTuple } from '../Tuple'
import Pipe from '../Pipe'
import QueryContext from '../QueryContext';

export default function countCommand(cxt: QueryContext, params: CommandExecutionParams) {
    const { tuple, output } = params;
    let count = 0;

    const combined = new Pipe();

    params.input.sendTo(combined);
    cxt.graph.run(tuple.setValue('verb', 'get'), combined);

    combined.sendTo({
        next(rel) {
            if (rel.hasAttr('command-meta'))
                return;
            count += 1;
        },
        done() {
            output.next(objectToTuple({count: count+''}));
            output.done();
        }
    });
}
