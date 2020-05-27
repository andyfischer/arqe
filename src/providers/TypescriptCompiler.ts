
import TypescriptCompilationAPI from './generated/TypescriptCompilationAPI'

export default function setup() {
    return new TypescriptCompilationAPI({
        async runTsc(dir: string) {
            return [];
        }
    });
}
