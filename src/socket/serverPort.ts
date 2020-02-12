
let port = 42940;

if (process.env.PORT)
    port = parseInt(process.env.PORT);

export default port;
