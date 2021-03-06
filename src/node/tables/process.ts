
let os;

export default {
    'process cwd': {
        'find': (input, out) => {
            out.done({cwd: process.cwd()});
        }
    },
    'cwd': {
        'find'(i, o) {
            o.done({cwd: process.cwd()});
        }
    },
    'home-dir'(i, o) {
        os = os || require('os')
        o.done({ 'home-dir': os.homedir() });
    }
}
