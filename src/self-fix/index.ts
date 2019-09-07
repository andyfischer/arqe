
import generateCommandImports from './commandImports'

async function main() {
    await generateCommandImports()
}

main()
.catch(console.error);
