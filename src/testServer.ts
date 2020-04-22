
import startServer from './startServer'
import watchFile from './file-watch/watchFile'

async function main() {
    await startServer();

    await watchFile('test', () => {
        console.log(`file 'test' changed`);
    });
}

main()
.catch(e => {
    process.exitCode = -1;
    console.error(e);
});
