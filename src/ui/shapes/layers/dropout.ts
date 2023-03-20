import * as tf from "@tensorflow/tfjs";
import { ActivationLayer } from "../activationlayer";
import { Layer } from "../layer";
import { Circle, Point } from "../shape";

export class Dropout extends Layer {
    public layerType: string = "Dropout";
    public parameterDefaults: { [key: string]: any } = {rate: 0.5};
    public readonly tfjsEmptyLayer: any = tf.layers.dropout;

    constructor(defaultLocation: Point = Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation)) {
        super([new Circle(new Point(0, 25), 20, "#ffffff", true)], defaultLocation);
    }

    public populateParamBox(): void {

        const line = document.createElement("div");
        line.className = "paramline";
        const name = document.createElement("div");
        name.className = "paramname";
        name.innerHTML = "Rate:";
        name.setAttribute("data-name", "rate");
        const value = document.createElement("input");
        value.className = "paramvalue layerparamvalue";
        value.value = "0.5";
        line.appendChild(name);
        line.appendChild(value);
        this.paramBox.append(line);
        this.focusing();
    }

    public setLayerParams(rate = 0.5): void {
        const line1 = this.paramBox.children[0];
        let ele = line1.lastChild as HTMLInputElement;
        ele.value = String(rate);
    }

    public getHoverText(): string { return "Dropout"; }

    public lineOfPython(): string {
        const params = this.getParams();

        return `Dropout(rate=${params.rate})`;
    }

    public initLineOfJulia(): string {
        const params = this.getParams();
        return `x${this.uid} = insert!(net, (shape) -> Dropout(${params.rate}))\n`;
    }

    public clone(): Dropout {
        const newLayer = new Dropout();
        newLayer.paramBox = this.paramBox;

        return newLayer;

    }
}
