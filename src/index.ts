
export { createExpressApp } from './express-promised-app'
export { print, randomHex } from './utils'

if (require.main === module) {
    require('./startup/main');
}
