import * as tf from "@tensorflow/tfjs";
import { ActivationLayer } from "../activationlayer";
import { Layer } from "../layer";
import { PathShape, Point } from "../shape";

export class Concatenate extends Layer {
    public layerType: string = "Concatenate";
    public parameterDefaults: { [key: string]: any } = {};
    public readonly tfjsEmptyLayer: any = tf.layers.concatenate;

    constructor(defaultLocation: Point = Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation)) {
        super([new PathShape("M-28 -120 h28 v120 h-28 v-120 Z", "#54e3cf"),
               new PathShape("M-28 -81 h28 v2 h-28 v-3  Z", "rgba(20, 20, 20, 0.3)"),
               new PathShape("M-28 -41 h28 v2 h-28 v-3  Z", "rgba(20, 20, 20, 0.3)")], defaultLocation);
    }

    public populateParamBox(): void {return; }

    public getHoverText(): string { return "Concatenate"; }

    public lineOfPython(): string {
        return `Concatenate()`;
    }

    public initLineOfJulia(): string {
        return `x${this.uid}  = insert!(net, (x) -> vcat(x...))\n`;
    }

    public generateTfjsLayer(): void {
        // Concatenate layers handle fan-in
        const parents = [];
        for (const parent of this.parents) {
            parents.push(parent.getTfjsLayer());
        }
        this.tfjsLayer = this.tfjsEmptyLayer().apply(parents) as tf.SymbolicTensor;
    }

    public clone(): Concatenate {
        const newLayer = new Concatenate();
        // newLayer.paramBox = this.paramBox

        return newLayer;

    }
}
