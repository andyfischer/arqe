
import TypescriptCompilationAPI from './generated/TypescriptCompilationAPI'
import ChildProcess from 'child_process'
import Util from 'util'
const exec = Util.promisify(ChildProcess.exec);

const errorLineRegex = /^([a-zA-Z0-9\.\/]+)\(([0-9]+),([0-9]+)\): (.*)$/
const errorElaborationRegex = /  (.*)$/

export default function setup() {
    return new TypescriptCompilationAPI({
        async runTsc(dir: string) {
            console.log('running TSC in dir: ' + dir);

            const { stdout, stderr } = await exec('tsc -p ' + dir, {}).catch(e => e);

            const lines = stdout.split('\n').filter(line => line.trim() !== '');

            const errorEvents: { filename: string, lineno: string, colno: string, message: string, elaborations: string[] }[] = []

            for (const line of lines) {

                const errorMatch = errorLineRegex.exec(line);
                if (errorMatch) {
                    const [full, filename, lineno, colno, message] = errorMatch;
                    errorEvents.push({
                        filename,
                        lineno,
                        colno,
                        message,
                        elaborations: []
                    });
                    continue;
                }

                const elaborationMatch = errorElaborationRegex.exec(line);
                if (elaborationMatch) {
                    const [full, message] = elaborationMatch;
                    errorEvents[errorEvents.length-1].elaborations.push(message);
                    continue;
                }

                console.error('TypescriptCompiler: unrecognized stdout line: ' + line);
            }

            return errorEvents.map(evt => ({
                filename: evt.filename,
                lineno: evt.lineno,
                colno: evt.colno,
                message: evt.message,
            }))
        }
    });
}
