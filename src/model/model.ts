import * as tf from "@tensorflow/tfjs";
import {plotAccuracy,
        plotLoss,
        resetPlotValues,
        setupPlots,
        showConfusionMatrix,
        } from "./graphs";

import {getTrainData} from "./data";
import { model } from "./params_object";

export enum NetType {mlp, cnn, rnn}
export let networkType: NetType = NetType.mlp;

export function changeNetworkType(newType: NetType): void {
    networkType = newType;
}

/**
 * Compile and train the given model.
 *
 * @param {*} model The model to
 */
export async function train(): Promise<void> {
    // Set up all of the plots
    resetPlotValues();
    setupPlots();
    // setupTestResults();

    const optimizer = model.params.getOptimizer();

    model.architecture.compile({
        loss: model.params.loss,
        metrics: ["accuracy"],
        optimizer,
    });
    const batchSize = model.params.batchSize;
    const trainEpochs = model.params.epochs as number;

    // We'll keep a buffer of loss and accuracy values over time.
    let trainEpochCount: number = 0;

    const [trainX, trainY, testX, testY] = getTrainData();

    await model.architecture.fit(trainX, trainY, {
        batchSize,
        callbacks: {
            // onBatchEnd: async (batch: number, logs: tf.Logs) => {
            //     trainBatchCount++;
            //     const accBox = document.getElementById("ti_acc");
            //     const lossBox = document.getElementById("ti_loss");
            //     const trainBox = document.getElementById("ti_training");
            //     accBox.children[1].innerHTML = String(Number((100 * logs.acc).toFixed(2)));
            //     lossBox.children[1].innerHTML = String(Number((logs.loss).toFixed(2)));
            //     trainBox.children[1].innerHTML = String((trainBatchCount / totalNumBatches * 100).toFixed(1) + "%");
            //     totalLoss += logs.loss;
            //     totalAccuracy += logs.acc;
            //     if (batch % plotLossFrequency === 0) {
            //       // Compute the average loss for the last plotLossFrequency iterations
            //       plotLoss(trainBatchCount, totalLoss / (trainBatchCount - prevTrainBatchCount), "train");
            //       plotAccuracy(trainBatchCount, totalAccuracy / (trainBatchCount - prevTrainBatchCount), "train");
            //       prevTrainBatchCount = trainBatchCount;
            //       totalLoss = 0;
            //       totalAccuracy = 0;
            //     }
            //     await tf.nextFrame();
            // },
          onEpochEnd: async (_: number, logs: tf.Logs) => {
            trainEpochCount++;
                const trainBox = document.getElementById("ti_training");
                const accBox = document.getElementById("ti_acc");
                const lossBox = document.getElementById("ti_loss");
                accBox.children[1].innerHTML = String(Number((100 * logs.acc).toFixed(2)));
                lossBox.children[1].innerHTML = String(Number((logs.loss).toFixed(2)));
                trainBox.children[1].innerHTML = `${trainEpochCount}/${trainEpochs}`;
                
                const valAcc = logs.val_acc;
                const valLoss = logs.val_loss;
                const vaccBox = document.getElementById("ti_vacc");
                const vlossBox = document.getElementById("ti_vloss");
                vaccBox.children[1].innerHTML = String(Number((100 * valAcc).toFixed(2)));
                vlossBox.children[1].innerHTML = String(Number((valLoss).toFixed(2)));
                plotLoss(trainEpochCount, logs.loss, "train");
                plotAccuracy(trainEpochCount, logs.acc, "train");
                plotLoss(trainEpochCount, logs.val_loss, "validation");
                plotAccuracy(trainEpochCount, logs.val_acc, "validation");
                showConfusionMatrix();
                await tf.nextFrame();
            },
        },
        epochs: trainEpochs,
        validationData:[testX, testY],
        shuffle: true
    });

    await model.architecture.save('downloads://my-model');
}
