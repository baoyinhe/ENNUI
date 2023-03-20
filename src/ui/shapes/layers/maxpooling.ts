import * as tf from "@tensorflow/tfjs";
import { ActivationLayer } from "../activationlayer";
import { Layer } from "../layer";
import { Point, Rectangle } from "../shape";

export class MaxPooling2D extends Layer {
    public static readonly blockSize: number = 30;
    public layerType: string = "MaxPooling2D";
    public parameterDefaults: { [key: string]: any } = {poolSize: [2, 2], strides: [2, 2], padding: "same"};
    public readonly tfjsEmptyLayer: any = tf.layers.maxPool2d;

    constructor(defaultLocation: Point = Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation)) {
        super([new Rectangle(new Point(-44, -60), MaxPooling2D.blockSize, MaxPooling2D.blockSize, "#ffaaaa"),
               new Rectangle(new Point(-44, -30), MaxPooling2D.blockSize, MaxPooling2D.blockSize, "#986cc6"),
               new Rectangle(new Point(-14, -60), MaxPooling2D.blockSize, MaxPooling2D.blockSize, "#dbd274"),
               new Rectangle(new Point(-14, -30), MaxPooling2D.blockSize, MaxPooling2D.blockSize, "#729C62")],
               defaultLocation);
    }

    public populateParamBox(): void {
        const line = document.createElement("div");
        line.className = "paramline";
        const name = document.createElement("div");
        name.className = "paramname";
        name.innerHTML = "Pool size:";
        name.setAttribute("data-name", "poolSize");
        const value = document.createElement("input");
        value.className = "paramvalue layerparamvalue";
        value.value = "2, 2";
        line.appendChild(name);
        line.appendChild(value);
        this.paramBox.append(line);

        const line2 = document.createElement("div");
        line2.className = "paramline";
        const name2 = document.createElement("div");
        name2.className = "paramname";
        name2.innerHTML = "Strides:";
        name2.setAttribute("data-name", "strides");
        const value2 = document.createElement("input");
        value2.className = "paramvalue layerparamvalue";
        value2.value = "2, 2";
        line2.appendChild(name2);
        line2.appendChild(value2);
        this.paramBox.append(line2);

        const line3 = document.createElement("div");
        line3.className = "paramline selectline";
        const value3 = document.createElement("div");
        value3.className = "paramname";
        value3.innerHTML = "Padding:";
        value3.setAttribute("data-name", "padding");

        const selectDiv = document.createElement("div");
        selectDiv.className = "select";

        const arrow = document.createElement("div");
        arrow.className = "select__arrow";

        const select = document.createElement("select");
        select.className = "parameter-select";

        for (const value of ["same","valid"]) {
            const option = document.createElement("option");
            option.value = value;
            option.innerHTML = value;
            select.appendChild(option);
        }

        line3.appendChild(value3);
        line3.appendChild(selectDiv);
        selectDiv.appendChild(select);
        selectDiv.appendChild(arrow);
        this.paramBox.append(line3);

        this.focusing();
    }

    public setLayerParams(poolSize = [2, 2],
        strides = [2, 2],
        padding = 'same',): void {
        const poolline = this.paramBox.children[0];
        let ele = poolline.lastChild as HTMLInputElement;
        ele.value = String(poolSize[0] + ", " +poolSize[1]);
        const strideline = this.paramBox.children[1];
        ele = strideline.lastChild as HTMLInputElement;
        ele.value = String(strides[0] + ", " + strides[1]);
        const line3 = this.paramBox.children[2];
        let seele = line3.children[1].children[0] as HTMLSelectElement;
        if (padding === 'same') {
            seele.options[0].selected = true;
        } else if (padding === 'valid') {
            seele.options[1].selected = true;
        }
}

    public getHoverText(): string { return "Maxpool"; }

    public lineOfPython(): string {
        const params = this.getParams();
        return `MaxPooling2D(pool_size=(${params.poolSize}), strides=(${params.strides}))`;
    }

    public initLineOfJulia(): string {
        const params = this.getParams();
        return `x${this.uid} = insert!(net, (shape) -> (x) -> maxpool(x, (${params.poolSize})))\n`;
    }

    public clone(): MaxPooling2D {
        const newLayer = new MaxPooling2D(Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation));

        newLayer.paramBox = this.paramBox;
        return newLayer;
    }

}
