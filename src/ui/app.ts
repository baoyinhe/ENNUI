import * as d3 from "d3";
import { buildNetworkDAG, topologicalSort } from "../model/build_network";
import { generatePython } from "../model/code_generation";
import { download } from "../model/export_model";
import { setupPlots } from "../model/graphs";
import { train } from "../model/model";
import { model } from "../model/params_object";
import { loadStateIfPossible } from "../model/save_state_url";
import { changeNetworkType, NetType } from "../model/model";
import { clearError, displayError } from "./error";
import { blankTemplate, cnnTemplate, mlpTemplate } from "./model_templates";
import { Activation, Relu, Sigmoid, Tanh } from "./shapes/activation";
import { ActivationLayer } from "./shapes/activationlayer";
import { Draggable } from "./shapes/draggable";
import { Layer } from "./shapes/layer";
import { Add } from "./shapes/layers/add";
import { BatchNorm } from "./shapes/layers/batchnorm";
import { Concatenate } from "./shapes/layers/concatenate";
import { Conv2D } from "./shapes/layers/convolutional";
import { Dense } from "./shapes/layers/dense";
import { Dropout } from "./shapes/layers/dropout";
import { Flatten } from "./shapes/layers/flatten";
import { Input } from "./shapes/layers/input";
import { MaxPooling2D } from "./shapes/layers/maxpooling";
import { Output } from "./shapes/layers/output";
import { TextBox } from "./shapes/textbox";
import { WireGuide } from "./shapes/wireguide";
import { windowProperties } from "./window";
import { setupSerial } from './serial';
import { loadDataUrl } from '../model/data';
import { term } from './serial';
import * as path from 'path';

var spawn = require("child_process").spawn;


export interface IDraggableData {
    draggable: Draggable[];
    input: Input;
    output: Output;
}

export let svgData: IDraggableData = {
    draggable: [],
    input: null,
    output: null,
};

document.addEventListener("DOMContentLoaded", () => {

    // This function runs when the DOM is ready, i.e. when the document has been parsed
    setupSerial();
    setupPlots();

    setupOptionOnClicks();
    setupIndividualOnClicks();

    const categoryElements = document.getElementsByClassName("categoryTitle") as HTMLCollectionOf<HTMLElement>;
    for (const elmt of categoryElements) {
        makeCollapsable(elmt);  // 使可折叠
    }

    window.addEventListener("resize", resizeMiddleSVG);
    window.addEventListener("resize", setupPlots);

    resizeMiddleSVG();

    window.onkeyup = (event: KeyboardEvent) => {
        switch (event.key) {
            case "Escape":
                if (windowProperties.selectedElement) {
                    windowProperties.selectedElement.unselect();
                    windowProperties.selectedElement = null;
                }
                break;
            case "Delete":
                if (document.getElementsByClassName("focusParam").length === 0) {
                    deleteSelected();
                }
                break;
            case "Backspace":
                if (document.getElementsByClassName("focusParam").length === 0) {
                    deleteSelected();
                }
                break;
            case "Enter":
                break;
        }
    };

    windowProperties.wireGuide = new WireGuide();
    windowProperties.shapeTextBox = new TextBox();

    d3.select("#svg").on("mousemove", () => {
        if (windowProperties.selectedElement instanceof Layer) {
            windowProperties.wireGuide.moveToMouse();
        }
    });

    // 加载默认网络模型
    svgData = loadStateIfPossible();

    // 自动跳转到数据采集页面，否则终端可能有bug
    document.getElementById("datacollection").click();

    // Select the input block when we load the page
    // svgData.input.select();

});

function addOnClickToOptions(categoryId: string, func: (optionValue: string, element: HTMLElement) => void): void {
    for (const element of document.getElementById(categoryId).getElementsByClassName("option")) {
        element.addEventListener("click", () => {
            func(element.getAttribute("data-optionValue"), element as HTMLElement);
        });
    }
}

function setupOptionOnClicks(): void {
    addOnClickToOptions("tabselector", (tabType) => switchTab(tabType));
    addOnClickToOptions("layers", (layerType) => appendItem(layerType));
    addOnClickToOptions("templates", (templateType) => createTemplate(templateType));
    addOnClickToOptions("educationLayers", (articleType) => {
        document.getElementById("education" + articleType).scrollIntoView(true);
    });
    addOnClickToOptions("educationStory", (articleType) => {
        document.getElementById("education" + articleType).scrollIntoView(true);
    });
    addOnClickToOptions("optimizers", (optimizerType, element) => {
        selectOption("optimizers", element);
        model.params.optimizer = optimizerType;
    });
    addOnClickToOptions("losses", (lossType, element) => {
        selectOption("losses", element);
        model.params.loss = lossType;
    });
}

function selectOption(optionCategoryId: string, optionElement: HTMLElement): void {
    for (const option of document.getElementById(optionCategoryId).getElementsByClassName("option")) {
        option.classList.remove("selected");
    }
    optionElement.classList.add("selected");
}

function createTemplate(template: string): void {
    switch (template) {
        case "blank": blankTemplate(svgData); break;
        case "mlp": mlpTemplate(svgData); changeNetworkType(NetType.mlp); break;
        case "cnn": cnnTemplate(svgData); changeNetworkType(NetType.cnn);break;

    }
}

function appendItem(itemType: string): void {
    const item: Draggable = new ({
        add: Add,
        batchnorm: BatchNorm,
        concatenate: Concatenate,
        conv2D: Conv2D,
        dense: Dense,
        dropout: Dropout,
        flatten: Flatten,
        maxPooling2D: MaxPooling2D,
        relu: Relu,
        sigmoid: Sigmoid,
        tanh: Tanh,
    } as any)[itemType]();

    svgData.draggable.push(item);
}

function setupIndividualOnClicks(): void {
    document.getElementById("negativeInput").addEventListener("change", () => { loadDataUrl("negativeUrl"); });
    document.getElementById("punchInput").addEventListener("change", () => { loadDataUrl("punchUrl"); });
    document.getElementById("wingInput").addEventListener("change", () => { loadDataUrl("wingUrl"); });
    document.getElementById("ringInput").addEventListener("change", () => { loadDataUrl("ringUrl"); });

    document.getElementById("exportPython").addEventListener("click", () => {
        const filename = "model.py";
        download(generatePython(topologicalSort(svgData.input)), filename);
    });

    document.getElementById("exportTflite").addEventListener("click", () => {
        switchTab("datacollection");

        let fileObj = (document.getElementsByName("modelInput")[0] as any).files[0];
        if (!fileObj) {
            alert("请选择模型文件！")
            return
        }
        let modelPath = fileObj.path;
        let dirName = path.dirname(modelPath);

        // 模型转换流程：my-model.json -> keras_model.h5 -> model.tflite -> model.h
        let kerasModelPath = dirName + '\\keras_model.h5';
        let tflitePath = 'model.tflite';

        // 调试版
        var condaCmd = `conda activate tf && tensorflowjs_converter --input_format=tfjs_layers_model --output_format=keras ${modelPath} ${kerasModelPath} && tflite_convert --keras_model_file=${kerasModelPath} --output_file=${tflitePath} && .\\resources\\xxd.exe -i ${tflitePath} >> resources\\Arduino\\predict_gesture_mqtt\\model.h`

        // 发布版
        // var condaCmd = `conda activate tf && tensorflowjs_converter --input_format=tfjs_layers_model --output_format=keras ${modelPath} ${kerasModelPath} && tflite_convert --keras_model_file=${kerasModelPath} --output_file=${tflitePath} && .\\resources\\app\\resources\\xxd.exe -i ${tflitePath} >> resources\\app\\resources\\Arduino\\predict_gesture_mqtt\\model.h`

        var result = spawn("cmd.exe", ["/s", "/c", condaCmd]);

        result.stdout.on("data", function (data: string) {
            term.writeln(data);
        });

        result.stderr.on("data", function (data: string) {
            term.writeln(`ERROR: ${data}`);
        });

        result.on("exit", function (code: any) {
            if (code === 0) {
                confirm("导出成功！")
            } else {
                alert("导出失败！")
            }
            term.writeln("Exited with code " + code);
        });
    });

    document.getElementById("train").addEventListener("click", trainOnClick);

    document.getElementById("x").addEventListener("click", () => clearError());

    document.getElementById("svg").addEventListener("click", (event) => {
        // Only click if there is a selected element, and the clicked element is an SVG Element, and its id is "svg"
        // It does this to prevent unselecting if we click on a layer block or other svg shape
        if (windowProperties.selectedElement && event.target instanceof SVGElement && event.target.id === "svg") {
            windowProperties.selectedElement.unselect();
            windowProperties.selectedElement = null;
        }
    });
}

function deleteSelected(): void {
    if (windowProperties.selectedElement) {
        windowProperties.selectedElement.delete();
        windowProperties.selectedElement = null;
    }
}

async function trainOnClick(): Promise<void> {

    // Only train if not already training

    const training = document.getElementById("train");
    if (!training.classList.contains("train-active")) {
        clearError();

        // Grab hyperparameters
        setModelHyperparameters();

        const trainingBox = document.getElementById("ti_training");
        trainingBox.children[1].innerHTML = "Yes";
        training.innerHTML = "Training";
        training.classList.add("train-active");
        try {
            model.architecture = buildNetworkDAG(svgData.input);
            await train();
        } catch (error) {
            displayError(error);
        } finally {
            training.innerHTML = "Train";
            training.classList.remove("train-active");
            trainingBox.children[1].innerHTML = "No";
        }
    }
}

function dataCollectionClick(): void {
    // document.getElementById("paramshell").style.display = "none";
}

function resizeMiddleSVG(): void {
    const originalSVGWidth = 1000;

    const svgWidth = document.getElementById("middle").clientWidth;
    const svgHeight = document.getElementById("middle").clientHeight;

    const ratio = svgWidth / originalSVGWidth;

    const xTranslate = (svgWidth - originalSVGWidth) / 2;
    const yTranslate = Math.max(0, (svgHeight * ratio - svgHeight) / 2);

    // Modify initialization heights for random locations for layers/activations so they don't appear above the svg
    const yOffsetDelta = yTranslate / ratio - windowProperties.svgYOffset;
    ActivationLayer.defaultInitialLocation.y += yOffsetDelta;
    Activation.defaultLocation.y += yOffsetDelta;

    windowProperties.svgYOffset = yTranslate / ratio;
    windowProperties.svgTransformRatio = ratio;

    document.getElementById("svg").setAttribute("transform", `translate(${xTranslate}, ${yTranslate/2+20}) scale(${ratio}, ${ratio})  `);

    // Call crop position on each draggable to ensure it is within the new canvas boundary
    if (svgData.input != null) {
        svgData.input.cropPosition();
        svgData.input.moveAction();
    }
    if (svgData.output != null) {
        svgData.output.cropPosition();
        svgData.output.moveAction();
    }
    svgData.draggable.forEach((elem) => {
        elem.cropPosition();
        elem.moveAction();
    });
}

function toggleExpanderTriangle(categoryTitle: Element): void {
    categoryTitle.getElementsByClassName("expander")[0].classList.toggle("expanded");
}

function makeCollapsable(elmt: Element): void {
    elmt.addEventListener("click", () => {
        toggleExpanderTriangle(elmt);
        const arr = Array.prototype.slice.call(elmt.parentElement.children).slice(1);

        if (elmt.getAttribute("data-expanded") === "false") {
            for (const sib of arr) {
                if (sib.id !== "defaultparambox") {
                    sib.style.display = "block";
                }
            }

            elmt.setAttribute("data-expanded", "true");
        } else {
            for (const sib of arr) {
                sib.style.display = "none";
            }
            elmt.setAttribute("data-expanded", "false");
        }
    });
}

/**
 * Takes the hyperparemeters from the html and assigns them to the global model
 */
export function setModelHyperparameters(): void {
    let temp: number = 0;
    const hyperparams = document.getElementsByClassName("hyperparamvalue");

    for (const hp of hyperparams) {
        const name: string = hp.id;

        temp = Number(( document.getElementById(name) as HTMLInputElement).value);
        if (temp < 0 || temp == null) {
            const error: Error = Error("Hyperparameters should be positive numbers.");
            displayError(error);
            return;
        }
        switch (name) {
            case "learningRate":
                model.params.learningRate = temp;
                break;

            case "epochs":
                model.params.epochs = Math.trunc(temp);
                break;

            case "batchSize":
                model.params.batchSize = Math.trunc(temp);
                break;
        }
    }
}

export function tabSelected(): string {
    if (document.getElementById("datacollectionTab").style.display !== "none") {
        return "datacollectionTab";
    } else if (document.getElementById("networkTab").style.display !== "none") {
        return "networkTab";
    } else if (document.getElementById("progressTab").style.display !== "none") {
        return "progressTab";
    } else if (document.getElementById("educationTab").style.display !== "none") {
        return "educationTab";
    } else {
        throw new Error("No tab selection found");
    }
}

function switchTab(tabType: string): void {
    // Hide all tabs  (middle canvas)
    document.getElementById("datacollectionTab").style.display = "none";
    document.getElementById("networkTab").style.display = "none";
    document.getElementById("progressTab").style.display = "none";
    document.getElementById("educationTab").style.display = "none";

    // Hide all menus
    document.getElementById("datacollectionMenu").style.display = "none";
    document.getElementById("networkMenu").style.display = "none";
    document.getElementById("progressMenu").style.display = "none";
    document.getElementById("educationMenu").style.display = "none";

    // Hide all paramshells
    document.getElementById("datacollectionParamshell").style.display = "none";
    document.getElementById("networkParamshell").style.display = "none";
    document.getElementById("progressParamshell").style.display = "none";
    document.getElementById("educationParamshell").style.display = "none";

    // Unselect all tabs
    document.getElementById("datacollection").classList.remove("tab-selected");
    document.getElementById("network").classList.remove("tab-selected");
    document.getElementById("progress").classList.remove("tab-selected");
    document.getElementById("education").classList.remove("tab-selected");

    // Display only the selected tab
    document.getElementById(tabType + "Tab").style.display = null;
    document.getElementById(tabType).classList.add("tab-selected");
    document.getElementById(tabType + "Menu").style.display = null;
    document.getElementById(tabType + "Paramshell").style.display = null;
    document.getElementById("paramshell").style.display = null;
    document.getElementById("menu").style.display = null;
    // document.getElementById("menu_expander").style.display = null;

    switch (tabType) {
        case "datacollection": dataCollectionClick(); break; // TODO
        case "network": resizeMiddleSVG(); break;
        case "progress": setupPlots(); break;
        case "education":
            document.getElementById("paramshell").style.display = "none";
            break;
    }

    // Give border radius to top and bottom neighbors
    if (document.getElementsByClassName("top_neighbor_tab-selected").length > 0) {
        document.getElementsByClassName("top_neighbor_tab-selected")[0].classList
            .remove("top_neighbor_tab-selected");
        document.getElementsByClassName("bottom_neighbor_tab-selected")[0].classList
            .remove("bottom_neighbor_tab-selected");
    }

    const tabMapping = ["blanktab", "datacollection", "network", "progress",
        "middleblanktab", "education", "bottomblanktab"];
    const index = tabMapping.indexOf(tabType);

    document.getElementById(tabMapping[index - 1]).classList.add("top_neighbor_tab-selected");
    document.getElementById(tabMapping[index + 1]).classList.add("bottom_neighbor_tab-selected");
}
