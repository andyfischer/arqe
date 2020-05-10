import Plugin from './Plugin';
export default class PluginSet {
    tagsImplemented: {
        [tagName: string]: Plugin;
    };
}
