import * as tf from "@tensorflow/tfjs";
import { ActivationLayer } from "../activationlayer";
import { Layer } from "../layer";
import { PathShape, Point } from "../shape";

export class Flatten extends Layer {
    public layerType: string = "Flatten";
    public parameterDefaults: { [key: string]: any } = {};
    public readonly tfjsEmptyLayer: any  = tf.layers.flatten;

    constructor(defaultLocation: Point = Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation)) {
        super([new PathShape("M-90 -110 h15 l 15 100 h-15 Z", "#AA222F")], defaultLocation);
    }

    public populateParamBox(): void {return; }

    public getHoverText(): string { return "Flatten"; }

    public lineOfPython(): string {
        return `Flatten()`;
    }

    public initLineOfJulia(): string {
        return `x${this.uid} = insert!(net, (shape) -> (x) -> reshape(x, :, size(x, 4)))\n`;
    }

    public clone(): Flatten {
        return new Flatten();
    }
}
