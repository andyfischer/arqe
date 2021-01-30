
import CommandParams from '../CommandParams'
import Tuple from '../Tuple'

export default function annotateCommand(params: CommandParams) {
    const { tuple, input, output } = params;

    input.sendTo({
        next(t: Tuple) {
            output.next(t.addTags(tuple.tags));
        },
        done() {
            output.done()
        }
    });
}
