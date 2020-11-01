
export default {
    'process cwd': {
        'list-all': (input, out) => {
            out.done({cwd: process.cwd()});
        }
    }
}
