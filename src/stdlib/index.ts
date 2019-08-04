
import ChildProcess from 'child_process'
import { print } from '../utils'

export function spawn(cmd: string) {
    const args = cmd.split(' ');
    print('spawning process: ' + cmd);
    const proc = ChildProcess.spawn(args[0], args.slice(1));
}

export function zeroPad(num: number|string, len: number) {
    num = num + '';
    while (num.length < len)
        num = '0' + num;
    return num;
}
