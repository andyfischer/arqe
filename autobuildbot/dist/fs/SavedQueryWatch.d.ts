import SavedQuery from './SavedQuery';
export default class SavedQueryWatch {
    savedQuery: SavedQuery;
    sawChangeToken: number;
    constructor(savedQuery: SavedQuery);
    checkChange(): boolean;
}
