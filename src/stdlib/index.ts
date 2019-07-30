
import ChildProcess from 'child_process'
import { print } from '../utils'

export function spawn(cmd: string) {
    const args = cmd.split(' ');
    print('spawning process: ' + cmd);
    const proc = ChildProcess.spawn(args[0], args.slice(1));
}
