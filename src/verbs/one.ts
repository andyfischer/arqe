
import CommandParams from '../CommandParams'
import Tuple from '../Tuple';
import QueryContext from '../QueryContext'

export default function runVerbOne(params: CommandParams) {
    const { tuple, input, output } = params;

    let _hasSentOne = false;

    input.sendTo({
        next(t: Tuple) {
            if (t.isCommandMeta()) {
                if (_hasSentOne)
                    throw new Error("protocol error: header sent after non-header");

                output.next(t)
                return;
            }

            if (_hasSentOne)
                return;

            output.next(t);
            output.done();
            _hasSentOne = true;
        },
        done() {
            if (!_hasSentOne)
                output.done();
        }
    });
}
