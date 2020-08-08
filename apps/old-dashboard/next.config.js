
module.exports = {

    webpack: (config, options) => {
        config.node = {
            fs: 'empty',
            'source-map-support': 'empty'
        }
        return config;
    }
}
