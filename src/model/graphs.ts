import * as tf from "@tensorflow/tfjs";
import * as tfvis from "@tensorflow/tfjs-vis";
import { tabSelected } from "../ui/app";
import { testX, testY } from "./data";
import { model } from "./params_object";

const GRAPH_FONT_SIZE: number = 14;
const NUM_CLASSES: number = 4;


// TOOD: Remove this peice of problematic global state.
let confusionValues: any = [];
for (let i = 0; i < NUM_CLASSES; i++) {
  const arr = new Array(NUM_CLASSES);
  arr.fill(0, 0, NUM_CLASSES);
  confusionValues.push(arr);
}

export function showConfusionMatrix(): void {
  if (tabSelected() === "progressTab" && testX != undefined) {
    tf.tidy(() => {
      const output = model.architecture.predict(testX) as tf.Tensor<tf.Rank.R1>;

      const fixedLabels = testY.argMax(1) as tf.Tensor<tf.Rank.R1>;
      const predictions = output.argMax(1) as tf.Tensor<tf.Rank.R1>;

      tfvis.metrics.confusionMatrix(fixedLabels, predictions, NUM_CLASSES).then((confusionVals) => {
        confusionValues = confusionVals;
        renderConfusionMatrix();
      });

    });
  }

}

// TOOD: Remove this piece of problematic global state.
let lossValues: Array<Array<{x: number, y: number}>> = [[], []];
export function plotLoss(batchNum: number, loss: number, set: string): void {
  const series = set === "train" ? 0 : 1;
  // Set the first validation loss as the first training loss
  // if (series === 0 && lossValues[1].length === 0) {
  //   lossValues[1].push({x: batchNum, y: loss});
  // }
  lossValues[series].push({x: batchNum, y: loss});
  if (tabSelected() === "progressTab") {
    renderLossPlot();
  }
}

export function renderLossPlot(): void {
  const lossContainer = document.getElementById("loss-canvas");
  tfvis.render.linechart(
      {values: lossValues, series: ["train", "validation"]}, lossContainer, {
        xLabel: "Epoch #",
        yLabel: "Loss",  // tslint:disable-next-line: object-literal-sort-keys
        width: canvasWidth() / 2,
        height: canvasHeight() / 2,
        fontSize: GRAPH_FONT_SIZE,
      });
}

export function resetPlotValues(): void {
  // set initial accuracy values to 0,0 for validation
  accuracyValues = [[], [{x: 0, y: 0}]];
  lossValues = [[], []];
}

let accuracyValues = [[], [{x: 0, y: 0}]];
export function plotAccuracy(epochs: number, accuracy: number, set: string): void {
  const series = set === "train" ? 0 : 1;
  accuracyValues[series].push({x: epochs, y: accuracy});
  if (tabSelected() === "progressTab") {
    renderAccuracyPlot();
  }
}

export function renderAccuracyPlot(): void {
  const accuracyContainer = document.getElementById("accuracy-canvas");
  tfvis.render.linechart(
      {values: accuracyValues, series: ["train", "validation"]},
      accuracyContainer, {
        xLabel: "Epoch #",
        yLabel: "Accuracy",  // tslint:disable-next-line: object-literal-sort-keys
        width: canvasWidth() / 2,
        height: canvasHeight() / 2,
        yAxisDomain: [0, 1],
        fontSize: GRAPH_FONT_SIZE,
      });
}

function renderConfusionMatrix(): void {
  const confusionMatrixElement = document.getElementById("confusion-matrix-canvas");
  tfvis.render.confusionMatrix({
    labels: ["0", "1", "2", "3"],
    values: confusionValues ,
  }, confusionMatrixElement, {
    fontSize: GRAPH_FONT_SIZE,
    shadeDiagonal: false,
  });
}

function canvasWidth(): number {
  const columnGap = parseInt(getComputedStyle(document.getElementById("progressTab")).gridColumnGap, 10);
  return document.getElementById("middle").clientWidth - columnGap;
}

function canvasHeight(): number {
  const verticalPadding = parseInt(getComputedStyle(document.getElementById("progressTab")).padding, 10);
  const height = document.getElementById("middle").clientHeight - 2 * verticalPadding;
  return height;
}

export function setupPlots(): void {
  renderLossPlot();
  renderAccuracyPlot();
  renderConfusionMatrix();
}