
export default {
    'process cwd': {
        'find': (input, out) => {
            out.done({cwd: process.cwd()});
        }
    }
}
