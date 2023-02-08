import * as tf from "@tensorflow/tfjs";
import { SAMPLES_PER_GESTURE, COLLECT_DATA_NUM} from "../../../model/data";
import { getSvgOriginalBoundingBox } from "../../utils";
import { Layer } from "../layer";
import { Point, Rectangle } from "../shape";
import { networkType, NetType } from "../../../model/model";

export class Input extends Layer {
    public layerType: string = "Input";
    public parameterDefaults: { [key: string]: any } = {};
    public readonly tfjsEmptyLayer: any = tf.input;

    public defaultLocation: Point = new Point(100,
        getSvgOriginalBoundingBox(document.getElementById("svg") as any as SVGSVGElement).height / 2);

    constructor() {
        super([new Rectangle(new Point(0, 0), 40, 40, "#806CB7")],
              new Point(100,
                getSvgOriginalBoundingBox(document.getElementById("svg") as any as SVGSVGElement).height / 2));
    }

    public getHoverText(): string { return "Input"; }

    public delete(): void { this.unselect(); }

    public populateParamBox(): void {
        // Dataset input box
        // TODO: separate this logic out.
        // const line = document.createElement("div");
        // line.className = "paramline selectline";

        // const name = document.createElement("div");
        // name.className = "paramname";
        // name.innerHTML = "Shape:";
        // name.setAttribute("data-name", "dataset");

        // const selectDiv = document.createElement("div");
        // selectDiv.className = "select";

        // const arrow = document.createElement("div");
        // arrow.className = "select__arrow";

        // const select = document.createElement("select");
        // select.className = "parameter-select";

        // for (const value of [["mnist", "MNIST"], ["cifar", "Cifar-10"]]) {
        //     const option = document.createElement("option");
        //     option.value = value[0];
        //     option.innerHTML = value[1];
        //     select.appendChild(option);
        // }

        // line.appendChild(name);
        // line.appendChild(selectDiv);
        // selectDiv.appendChild(select);
        // selectDiv.appendChild(arrow);
        // this.paramBox.append(line);
        // this.focusing();
    }

    public generateTfjsLayer(): void {
        // TODO make this a member variable
        switch (networkType) {
            case NetType.mlp:
                this.tfjsLayer = this.tfjsEmptyLayer({
                    shape: [
                        SAMPLES_PER_GESTURE * COLLECT_DATA_NUM]
                });
                break;
            case NetType.cnn:
                this.tfjsLayer = this.tfjsEmptyLayer({
                    shape: [
                        SAMPLES_PER_GESTURE, COLLECT_DATA_NUM, 1]
                });
                break;
            case NetType.rnn:
                this.tfjsLayer = this.tfjsEmptyLayer({
                    shape: [
                        SAMPLES_PER_GESTURE, COLLECT_DATA_NUM]
                });
                break;
        }
    }

    public lineOfPython(): string {
        // Relies on an input_shape being defined in the python skeleton
        return `Input(shape=input_shape)`;
    }

    public initLineOfJulia(): string {
        return `x${this.uid} = insert!(net, (shape) -> x -> x)\n`;
    }

    public clone(): Input {
        const newLayer = new Input();
        return newLayer;
    }
}
