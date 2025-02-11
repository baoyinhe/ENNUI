import { IDraggableData } from "./app";
import { Activation, Relu } from "./shapes/activation";
import { ActivationLayer } from "./shapes/activationlayer";
import { Layer } from "./shapes/layer";
import { Add } from "./shapes/layers/add";
import { BatchNorm } from "./shapes/layers/batchnorm";
import { Concatenate } from "./shapes/layers/concatenate";
import { Conv2D } from "./shapes/layers/convolutional";
import { Dense } from "./shapes/layers/dense";
import { Dropout } from "./shapes/layers/dropout";
import { Flatten } from "./shapes/layers/flatten";
import { MaxPooling2D } from "./shapes/layers/maxpooling";
import { Point } from "./shapes/shape";
import { getSvgOriginalBoundingBox } from "./utils";
import { windowProperties } from "./window";

export function resetWorkspace(svgData: IDraggableData): void {
    // Deselect current element
    if (windowProperties.selectedElement != null) {
        windowProperties.selectedElement.unselect();
    }
    // Set input and output locations
    if (svgData.input != null) {
        svgData.input.setPosition(svgData.input.defaultLocation);
        svgData.input.wires.forEach((w) => w.delete());
    }
    if (svgData.output != null) {
        svgData.output.setPosition(svgData.output.defaultLocation);
    }

    // Remove all other layers
    for (const layer of svgData.draggable) {
        layer.delete();
    }

    // Clear the current list of draggables
    svgData.draggable = [];
}

export function defaultTemplate(svgData: IDraggableData): void {
    mlpTemplate(svgData);
}

export function blankTemplate(svgData: IDraggableData): void {
    resetWorkspace(svgData);
}

export function resnetTemplate(svgData: IDraggableData): void {
    resetWorkspace(svgData);

    // Initialize each of the layers and activations
    const canvasBoundingBox = getSvgOriginalBoundingBox(document.getElementById("svg") as any as SVGSVGElement);
    const width = canvasBoundingBox.width;
    const height = canvasBoundingBox.height;

    const conv0Pos = new Point(width * 0.26, height * 0.57);
    const conv1Pos = new Point(width * 0.26, height * 0.372);
    const conv2Pos = new Point(width * 0.404, height * 0.372);
    const conv3Pos = new Point(width * 0.404, height * 0.78);
    const conv4Pos = new Point(width * 0.537, height * 0.78);
    const add1Pos = new Point(width * 0.387, height * 0.547);
    const add2Pos = new Point(width * 0.521, height * 0.547);
    const flattenPos = new Point(width * 0.708, height * 0.606);
    const densePos = new Point(width * 0.702, height * 0.566);
    const dropoutPos = new Point(width * 0.778, height * 0.477);

    const conv0: ActivationLayer = new Conv2D(conv0Pos);
    const conv1: ActivationLayer = new Conv2D(conv1Pos);
    const conv2: ActivationLayer = new Conv2D(conv2Pos);
    const conv3: ActivationLayer = new Conv2D(conv3Pos);
    const conv4: ActivationLayer = new Conv2D(conv4Pos);
    const conv1Relu: Activation = new Relu(conv1Pos);
    const conv3Relu: Activation = new Relu(conv3Pos);
    const add1: ActivationLayer = new Add(add1Pos);
    const add2: ActivationLayer = new Add(add2Pos);
    const add1Relu: Activation = new Relu(add1Pos);
    const add2Relu: Activation = new Relu(add2Pos);
    const flatten: Flatten = new Flatten(flattenPos);
    const dense: ActivationLayer = new Dense(densePos);
    const denseRelu: Activation = new Relu(densePos);
    const dropout: Layer = new Dropout(dropoutPos);

    // Add activations to layers
    conv1.addActivation(conv1Relu);
    conv3.addActivation(conv3Relu);
    add1.addActivation(add1Relu);
    add2.addActivation(add2Relu);
    dense.addActivation(denseRelu);

    // Add relationships among layers and activations
    svgData.input.addChild(conv0);

    conv0.addChild(add1);
    conv0.addChild(conv1);

    conv1.addChild(conv2);
    conv2.addChild(add1);

    add1.addChild(conv3);
    add1.addChild(add2);

    conv3.addChild(conv4);
    conv4.addChild(add2);

    add2.addChild(flatten);
    flatten.addChild(dense);
    dense.addChild(dropout);
    dropout.addChild(svgData.output);

    // Store the new network
    svgData.draggable.push(conv0);
    svgData.draggable.push(conv1);
    svgData.draggable.push(conv2);
    svgData.draggable.push(conv3);
    svgData.draggable.push(conv4);
    svgData.draggable.push(add1);
    svgData.draggable.push(add2);
    svgData.draggable.push(flatten);
    svgData.draggable.push(dense);
    svgData.draggable.push(dropout);
    svgData.draggable.push(conv1Relu);
    svgData.draggable.push(conv3Relu);
    svgData.draggable.push(add1Relu);
    svgData.draggable.push(add2Relu);
    svgData.draggable.push(denseRelu);
}

export function complexTemplate(svgData: IDraggableData): void {
    resetWorkspace(svgData);

    // Initialize each of the layers and activations
    const canvasBoundingBox = getSvgOriginalBoundingBox(document.getElementById("svg") as any as SVGSVGElement);
    const width = canvasBoundingBox.width;
    const height = canvasBoundingBox.height;
    const convStartingPosition = new Point(width / 3.5, height / 3);
    const denseStartingPosition = new Point(width * 3 / 4, height / 2);
    const conv2StartingPosition = new Point(width / 3.5, height * 2 / 3);
    const batchStartingPosition = new Point(width / 2.5, height * 2 / 3);
    const maxpoolingStartingPosition = new Point(width / 2.5, height / 3);
    const concatStartingPosition = new Point(width * 2 / 3, height / 1.9);
    const flat1StartingPosition = new Point(width / 1.7, height / 2.2);
    const flat2StartingPosition = new Point(width / 1.7, height * 2 / 3);

    const conv: ActivationLayer = new Conv2D(convStartingPosition);
    const convRelu: Activation = new Relu(convStartingPosition);
    const dense: ActivationLayer = new Dense(denseStartingPosition);
    const denseRelu: Activation = new Relu(denseStartingPosition);
    const conv2: ActivationLayer = new Conv2D(conv2StartingPosition);
    const maxpooling: MaxPooling2D = new MaxPooling2D(maxpoolingStartingPosition);
    const concat: Concatenate = new Concatenate(concatStartingPosition);
    const batch: ActivationLayer = new BatchNorm(batchStartingPosition);
    const batchRelu2: Activation = new Relu(batchStartingPosition);
    const flat1: Flatten = new Flatten(flat1StartingPosition);
    const flat2: Flatten = new Flatten(flat2StartingPosition);

    // Add relationships among layers and activations
    // in -> conv, in -> conv2
    svgData.input.addChild(conv);
    svgData.input.addChild(conv2);

    // conv -> maxpool
    conv.addChild(maxpooling);
    conv.addActivation(convRelu);

    // maxpooling -> flat1
    maxpooling.addChild(flat1);

    // conv2 -> batch
    conv2.addChild(batch);

    // batch -> flat2
    batch.addChild(flat2);
    batch.addActivation(batchRelu2);

    // concat -> dense
    concat.addChild(dense);

    // flat1 -> concat
    flat1.addChild(concat);

    // flat2 -> concat
    flat2.addChild(concat);

    // dense -> out
    dense.addActivation(denseRelu);
    dense.addChild(svgData.output);

    // Store the new network
    svgData.draggable.push(conv);
    svgData.draggable.push(conv2);
    svgData.draggable.push(dense);
    svgData.draggable.push(maxpooling);
    svgData.draggable.push(convRelu);
    svgData.draggable.push(batchRelu2);
    svgData.draggable.push(concat);
    svgData.draggable.push(flat1);
    svgData.draggable.push(flat2);
    svgData.draggable.push(batch);
}


export function mlpTemplate(svgData: IDraggableData): void {
    resetWorkspace(svgData);

    // Initialize each of the layers and activations
    const canvasBoundingBox = getSvgOriginalBoundingBox(document.getElementById("svg") as any as SVGSVGElement);
    const width = canvasBoundingBox.width;
    const height = canvasBoundingBox.height;

    const dense0Pos = new Point(width * 2 / 6.5, height / 2.48);
    const dense1Pos = new Point(width * 3 / 6.5, height / 2.48);

    const dense0: Dense = new Dense(dense0Pos);
    dense0.setLayerParams(32);
    const dense1: Dense = new Dense(dense1Pos);
    dense1.setLayerParams(16);
    const dense0Relu: Activation = new Relu(dense0Pos);
    const dense1Relu: Activation = new Relu(dense1Pos);

    // Add relationships among layers and activations
    svgData.input.addChild(dense0);
    dense0.addActivation(dense0Relu);
    dense0.addChild(dense1);
    
    dense1.addActivation(dense1Relu);
    dense1.addChild(svgData.output);

    // Store the new network
    svgData.draggable.push(dense0);
    svgData.draggable.push(dense1);
    svgData.draggable.push(dense0Relu);
    svgData.draggable.push(dense1Relu);
}

export function cnnTemplate(svgData: IDraggableData): void {
    resetWorkspace(svgData);

    // Initialize each of the layers and activations
    const canvasBoundingBox = getSvgOriginalBoundingBox(document.getElementById("svg") as any as SVGSVGElement);
    const width = canvasBoundingBox.width;
    const height = canvasBoundingBox.height;

    const conv0Pos = new Point(width * 1.5 / 7, height / 5);
    const maxpool0Pos = new Point(width * 2.5 / 7, height / 5.3);
    const dropout0Pos = new Point(width * 3 / 7, height / 7.9);
    const conv1Pos = new Point(width * 4.3 / 7, height / 5);
    const maxpool1Pos = new Point(width * 5.1 / 7, height / 5.3);
    const dropout1Pos = new Point(width * 5.8 / 7, height / 7.9);
    const flattenPos = new Point(width * 3 / 8, height / 2);
    const dense0Pos = new Point(width * 4 / 8, height / 2.2);
    const dropout2Pos = new Point(width * 4.8 / 8, height / 2.7);

    const conv0: Conv2D = new Conv2D(conv0Pos);
    conv0.setLayerParams(8, [3, 3]);
    const conv0Relu: Activation = new Relu(conv0Pos);
    const maxpool0: MaxPooling2D = new MaxPooling2D(maxpool0Pos);
    maxpool0.setLayerParams([3, 3], [3, 3]);
    const droupout0: Dropout = new Dropout(dropout0Pos);
    droupout0.setLayerParams(0.1);
    const conv1: Conv2D = new Conv2D(conv1Pos);
    conv1.setLayerParams(16, [3, 1]);
    const conv1Relu: Activation = new Relu(conv1Pos);
    const maxpool1: MaxPooling2D = new MaxPooling2D(maxpool1Pos);
    maxpool1.setLayerParams([3, 1], [3, 1]);
    const droupout1: Dropout = new Dropout(dropout1Pos);
    droupout1.setLayerParams(0.1);
    const flat: Flatten = new Flatten(flattenPos);
    const dense0: Dense = new Dense(dense0Pos);
    dense0.setLayerParams(16);
    const dense0Relu: Activation = new Relu(dense0Pos);
    const droupout2: Dropout = new Dropout(dropout2Pos);
    droupout2.setLayerParams(0.1);
    

    // Add relationships among layers and activations
    svgData.input.addChild(conv0);
    conv0.addActivation(conv0Relu);
    conv0.addChild(maxpool0);
    maxpool0.addChild(droupout0);
    droupout0.addChild(conv1);

    conv1.addActivation(conv1Relu);
    conv1.addChild(maxpool1);
    maxpool1.addChild(droupout1);
    droupout1.addChild(flat);

    flat.addChild(dense0);
    dense0.addActivation(dense0Relu);
    dense0.addChild(droupout2);
    droupout2.addChild(svgData.output);

    // Store the new network
    svgData.draggable.push(conv0);
    svgData.draggable.push(conv0Relu);
    svgData.draggable.push(maxpool0);
    svgData.draggable.push(droupout0);
    svgData.draggable.push(conv1);
    svgData.draggable.push(conv1Relu);
    svgData.draggable.push(maxpool1);
    svgData.draggable.push(droupout1);
    svgData.draggable.push(flat);
    svgData.draggable.push(dense0);
    svgData.draggable.push(dense0Relu);
    svgData.draggable.push(droupout2);
}
