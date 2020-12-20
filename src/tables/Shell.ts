
import { TableDefiner } from '..'
import ChildProcess from 'child_process'

export default (def: TableDefiner) =>
    def.provide('table required(shell cmd) cwd stdout', {
        'find cmd': (input, out) => {
            const cmd = input.get('cmd');
            const args = cmd.split(' ');

            const proc = ChildProcess.spawn(args[0], args.slice(1), {
                stdio: 'pipe',
                cwd: input.getOptional('cwd', null),
                shell: true
            });

            proc.stdout.on('data', data => {
                data = data.toString()
                    .replace(/\n$/, '')
                    .split('\n');

                for (const line of data)
                    out.next({stdout: line});
            });

            proc.stdout.on('end', () => {
                out.done();
            });
        }
    })

