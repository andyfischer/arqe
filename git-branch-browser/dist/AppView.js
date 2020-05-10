"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const ink_1 = require("ink");
function AppView({ dir, api }) {
    let [items, setItems] = react_1.useState([]);
    let [selectedIndex, setSelectedIndex] = react_1.useState(0);
    async function refreshItems() {
        const items = await api.getBranches(dir);
        setItems(items);
        if (selectedIndex >= items.length)
            selectedIndex = items.length - 1;
    }
    function selectUp() {
        if (selectedIndex > 0)
            setSelectedIndex(selectedIndex - 1);
    }
    function selectDown() {
        if (selectedIndex < (items.length - 1))
            setSelectedIndex(selectedIndex + 1);
    }
    async function handleInput(data) {
        if (data === 'j')
            selectDown();
        if (data === 'k')
            selectUp();
        if (data === 'd') {
            const current = items[selectedIndex];
            await api.deleteBranch(dir, current);
            await refreshItems();
        }
    }
    ink_1.useInput((input, key) => {
        handleInput(input);
    });
    react_1.useEffect((() => { refreshItems(); }), []);
    return react_1.default.createElement(ink_1.Box, { flexDirection: "column" },
        react_1.default.createElement(ink_1.Text, null, "[press 'd' to delete]"),
        items.map((item, i) => {
            const selected = selectedIndex === i;
            return react_1.default.createElement(ink_1.Box, { key: item, marginRight: 1 },
                selected && react_1.default.createElement(ink_1.Color, { hex: "#ff00ff" },
                    '> ',
                    item),
                !selected && '  ' + item);
        }));
}
exports.default = AppView;
//# sourceMappingURL=AppView.js.map