import QueryContext from "../QueryContext";
import CommandParams from "../CommandParams";

export default function singleValue(params: CommandParams) {
    params.output.next(params.tuple);

    params.input.sendTo(params.output);
}
