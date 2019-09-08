
import commandsIndex from './commandsIndex'
import queryWatcherIndex from './queryWatcherIndex'

async function main() {
    await commandsIndex()
    await queryWatcherIndex()
}

main()
.catch(console.error);
