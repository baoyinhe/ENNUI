import * as tf from "@tensorflow/tfjs";
import { ActivationLayer } from "../activationlayer";
import { PathShape, Point, Rectangle } from "../shape";

export class Conv2D extends ActivationLayer {
    public static readonly blockSize: number = 50;
    public layerType: string = "Conv2D";
    public parameterDefaults: { [key: string]: any } = {
        filters: 16,
        kernelRegularizer: "none",
        kernelSize: [3, 3],
        padding: "same",
        regScale: 0.1,
        strides: [1, 1],
    };
    protected tfjsEmptyLayer: any = tf.layers.conv2d;

    constructor(defaultLocation: Point = Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation)) {
        super([new Rectangle(new Point(-54, -80), Conv2D.blockSize, Conv2D.blockSize, "#184aec"),
               new Rectangle(new Point(-37, -60), Conv2D.blockSize, Conv2D.blockSize, "#58d64c"),
               new PathShape("M-20 -40 h50 v50 h-20 v-10 h-10 v10 h-20 v-50 Z", "#fa2305")],
               defaultLocation);
    }

    public populateParamBox(): void {
        const line1 = document.createElement("div");
        line1.className = "paramline";

        const name1 = document.createElement("div");
        name1.className = "paramname";
        name1.innerHTML = "Filters:";
        name1.setAttribute("data-name", "filters");

        const value1 = document.createElement("input");
        value1.className = "paramvalue layerparamvalue";
        value1.value = "16";

        line1.appendChild(name1);
        line1.appendChild(value1);

        this.paramBox.append(line1);

        const line2 = document.createElement("div");
        line2.className = "paramline";
        const name2 = document.createElement("div");
        name2.className = "paramname";
        name2.innerHTML = "Kernel size:";
        name2.setAttribute("data-name", "kernelSize");
        const value2 = document.createElement("input");
        value2.className = "paramvalue layerparamvalue";
        value2.value = "3, 3";
        line2.appendChild(name2);
        line2.appendChild(value2);
        this.paramBox.append(line2);

        const line3 = document.createElement("div");
        line3.className = "paramline";
        const name3 = document.createElement("div");
        name3.className = "paramname";
        name3.innerHTML = "Stride:";
        name3.setAttribute("data-name", "strides");
        const value3 = document.createElement("input");
        value3.className = "paramvalue layerparamvalue";
        value3.value = "1, 1";
        line3.appendChild(name3);
        line3.appendChild(value3);
        this.paramBox.append(line3);

        const line4 = document.createElement("div");
        line4.className = "paramline selectline";
        const value4 = document.createElement("div");
        value4.className = "paramname";
        value4.innerHTML = "Padding:";
        value4.setAttribute("data-name", "padding");

        const selectDiv4 = document.createElement("div");
        selectDiv4.className = "select";

        const arrow4 = document.createElement("div");
        arrow4.className = "select__arrow";

        const select4 = document.createElement("select");
        select4.className = "parameter-select";

        for (const value of ["same","valid"]) {
            const option = document.createElement("option");
            option.value = value;
            option.innerHTML = value;
            select4.appendChild(option);
        }

        line4.appendChild(value4);
        line4.appendChild(selectDiv4);
        selectDiv4.appendChild(select4);
        selectDiv4.appendChild(arrow4);
        this.paramBox.append(line4);

        // Dataset input box
        // TODO: separate this logic out.
        const line5 = document.createElement("div");
        line5.className = "paramline selectline";

        const name5 = document.createElement("div");
        name5.className = "paramname";
        name5.innerHTML = "Norm:";
        name5.setAttribute("data-name", "kernelRegularizer");

        const selectDiv = document.createElement("div");
        selectDiv.className = "select";

        const arrow = document.createElement("div");
        arrow.className = "select__arrow";

        const select = document.createElement("select");
        select.className = "parameter-select";

        for (const value of [["none", "None"], ["l1", "L1"], ["l2", "L2"]]) {
            const option = document.createElement("option");
            option.value = value[0];
            option.innerHTML = value[1];
            select.appendChild(option);
        }

        line5.appendChild(name5);
        line5.appendChild(selectDiv);
        selectDiv.appendChild(select);
        selectDiv.appendChild(arrow);
        this.paramBox.append(line5);

        const line6 = document.createElement("div");
        line6.className = "paramline";
        const name6 = document.createElement("div");
        name6.className = "paramname";
        name6.innerHTML = "Scale:";
        name6.setAttribute("data-name", "regScale");
        const value6 = document.createElement("input");
        value6.className = "paramvalue layerparamvalue";
        value6.value = "0.1";
        line6.appendChild(name6);
        line6.appendChild(value6);
        this.paramBox.append(line6);
        line6.classList.add("hidden_div");
        select.addEventListener("change", () => {
            if (select.value !== "none" && line6.classList.contains("hidden_div")) {
                line6.classList.toggle("hidden_div");
            }

            if (select.value === "none" && !line6.classList.contains("hidden_div")) {
                line6.classList.add("hidden_div");
            }
        });
        this.focusing();

    }

    public setLayerParams(filters = 16,
                        kernelSize = [3, 3],
                        strides = [1, 1],
                        padding = 'same'): void {
        const filtersline = this.paramBox.children[0];
        let ele = filtersline.lastChild as HTMLInputElement;
        ele.value = String(filters);
        const kernelline = this.paramBox.children[1];
        ele = kernelline.lastChild as HTMLInputElement;
        ele.value = String(kernelSize[0] + ", " +kernelSize[1]);
        const strideline = this.paramBox.children[2];
        ele = strideline.lastChild as HTMLInputElement;
        ele.value = String(strides[0] + ", " + strides[1]);
        const line4 = this.paramBox.children[3];
        let seele = line4.children[1].children[0] as HTMLSelectElement;
        if (padding === 'same') {
            seele.options[0].selected = true;
        } else if (padding === 'valid') {
            seele.options[1].selected = true;
        }
    }

    public getHoverText(): string { return "Conv"; }

    public lineOfPython(): string {
        const params = this.getParams();
        const activation = this.getActivationText();
        const activationText = activation == null ? "" : `, activation='${activation}'`;
        return `Conv2D(${params.filters}, (${params.kernelSize}),` +
            `strides=(${params.strides})${activationText}, padding='${params.padding}')`;
    }

    public initLineOfJulia(): string {
        const params = this.getParams();
        const activation = this.getActivationText();
        const activationText = activation == null ? "" : `, ${activation}`;
        return `x${this.uid} = insert!(net, (shape) -> Conv((${params.kernelSize}),` +
            `shape[3] =>${params.filters}${activationText}, stride=(${params.strides})))\n`;
    }

    public clone(): Conv2D {
        const newConv: Conv2D = new Conv2D(Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation));
        newConv.activation = this.activation;
        newConv.paramBox = this.paramBox;

        return newConv;

    }

    public getParams(): { [key: string]: any } {
        const parameters = super.getParams();
        const scale = parameters.regScale;
        delete parameters.regScale;
        switch (parameters.kernelRegularizer) {
            case "none":
                delete parameters.kernelRegularizer;
            case "l1":
                parameters.kernelRegularizer = tf.regularizers.l1({l1: scale});
            case "l2":
                parameters.kernelRegularizer = tf.regularizers.l2({l2: scale});
        }
        return parameters;
    }
}
