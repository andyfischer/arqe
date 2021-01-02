
import ChildProcess from 'child_process'
import { toTuple } from '..'

export default (def) => def
    .provide('table required(git ref) cwd sha1 commit-date pretty-date', {
        'find sq(subquery)': (input, out) => {

            const { sq } = input.obj();
            const command = `git for-each-ref --sort=committerdate refs/heads/ --format='%(HEAD) %(refname:short) %(objectname) %(committerdate:unix)'`
            
            let shell = toTuple('get shell stdout')
                .setValue('cmd', command)

            if (input.hasValue('cwd'))
                shell = shell.addTag(input.getTag('cwd'));

            sq(shell)
            .then(rel => {
                for (const t of rel.body()) {
                    const line = t.get('stdout');
                    const isCurrent = /^ \*/.exec(line);
                    const fields = line.slice(2).split(' ');

                    out.next({'ref': fields[0], sha1: fields[1], 'commit-date': fields[2],
                        'pretty-date': new Date(parseInt(fields[2])*1000)
                    })
                }
                out.done();
            })
        },
        'delete ref sq(subquery)': (input, out) => {
            console.log('called delete..', input.stringify())

            const { sq } = input.obj();



            const command = `git for-each-ref --sort=committerdate refs/heads/ --format='%(HEAD) %(refname:short) %(objectname) %(committerdate:unix)'`
            let shell = toTuple('get shell stdout')
                .setValue('cmd', command)

            out.done();
        }
    })

