
const { ESLint } = require("eslint");
const { handles, decoratedObjToTableMount } = require("arqe");

class EslintCheck {
    name = 'EslintCheck'
    schemaStr = 'eslint source filename? ruleId? severity? message? messageId? line? column? endLine? endColumn?'
    eslint = new ESLint()

    @handles('find-with source')
    async checkSource({ source, filename }) {
        const results = await this.eslint.lintText(source, { filePath: filename });

        const out = [];
        for (const result of results)
            for (const message of result.messages)
                out.push(message);

        return out;
    }
}

module.exports = {
    setupTables: () => {
        return [
            decoratedObjToTableMount(new EslintCheck())
        ]
    }
}
