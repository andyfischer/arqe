
import { TableDefiner } from '..'
import ChildProcess from 'child_process'

export default (def: TableDefiner) =>
    def.provide('table required(shell cmd) cwd stdout stderr', {
        'find cmd': (input, out) => {
            const cmd = input.get('cmd');
            const args = cmd.split(' ');
            const cwd = input.getOptional('cwd', null);

            const proc = ChildProcess.spawn(args[0], args.slice(1), {
                stdio: 'pipe',
                cwd,
                shell: true
            });

            proc.on('error', err => {
                console.log('proc error: ', err);
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

            if (input.hasAttr('stderr')) {
                proc.stderr.on('data', data => {
                    data = data.toString()
                        .replace(/\n$/, '')
                        .split('\n');

                    for (const line of data)
                        out.next({stderr: line});
                });
            }
        }
    })

