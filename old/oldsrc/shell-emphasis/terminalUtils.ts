
import { consoleColorizeOutput } from '../terminal/colorizeConsoleOutput'

export function print(...args: string[]) {

    const str = consoleColorizeOutput(args.join(' '));

    printEvents.emit('beforeLog', {});

    console.log(str);

    printEvents.emit('afterLog', {});
}

