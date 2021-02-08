import CommandExecutionParams from '../CommandParams'

export default function reverseCommand(params: CommandExecutionParams) {
    const { tuple, input, output } = params;

    let buffer = [];

    input.sendTo({
        next(t) {
            if (t.isCommandMeta()) {
                output.next(t);
                return;
            }

            buffer.push(t);
        },
        done() {
            for (let i = buffer.length - 1; i >= 0; i--) {
                output.next(buffer[i]);
            }
            output.done();
        }
    }, 'reverse');
}
