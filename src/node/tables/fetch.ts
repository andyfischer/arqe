
export default def => {
    def.provide('fetch url output', {
        async 'find url sq(subquery)'(i,o) {
            const { sq, url } = i.obj();

            const fetch = require('node-fetch');

            const response = await fetch(url, {
                headers: {
                    'user-agent': 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36'
                }
            }).then(res => res.text());

            o.done({output: response})
        }
    });
}
