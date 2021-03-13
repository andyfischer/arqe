
import Tuple from '../../Tuple'
import TableDefiner from '../../TableDefiner'
import ChildProcess from 'child_process'

export default (def: TableDefiner) => {
    def.provide('table required(shell cmd) values(cwd stdout stderr)', {
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

    def.provide('table required(shell cmd output) values(cwd stderr)', {
        'find sq(subquery)'(i: Tuple, o) {
            const { sq } = i.obj();

            sq(i.drop('sq').drop('output').addAttr('stdout'))
            .then(rel => {
                const joined = rel.columnArr('stdout').join('\n');

                o.done({output: joined});
            })
        }
    })
}
