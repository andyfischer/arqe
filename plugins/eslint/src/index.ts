
const { ESLint } = require("eslint");
const { handles, decoratedObjToTableMount } = require("arqe");

class EslintCheck {
    name = 'EslintCheck'
    schemaStr = 'eslint source filename?'
    eslint = new ESLint()

    @handles('find-with source')
    async checkSource({ source, filename }) {
        console.log('this = ', this)
        const results = await this.eslint.lintText(source, { filePath: filename });

        return results;
    }
}

module.exports = {
    setupTables: () => {
        return [
            decoratedObjToTableMount(new EslintCheck())
        ]
    }
}
