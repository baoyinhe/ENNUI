import * as tf from "@tensorflow/tfjs";
import { networkType, NetType } from "./model";
var fs = require("fs");

const negativeUrl = 'D:/Study/bisheReposity/ENNUI/src/model/data/negative.csv';
const punchUrl = 'D:/Study/bisheReposity/ENNUI/src/model/data/punch.csv';
const ringUrl = 'D:/Study/bisheReposity/ENNUI/src/model/data/ring.csv';
const wingUrl = 'D:/Study/bisheReposity/ENNUI/src/model/data/wing.csv';

export const SAMPLES_PER_GESTURE = 50;
export const COLLECT_DATA_NUM = 6;
export const VALIDDATAPORTION = 0.2;
export const NUM_CLASSES = 4;

export let trainX: tf.Tensor;
export let trainY: tf.Tensor;
export let testX: tf.Tensor;
export let testY: tf.Tensor;

/** 
 * @param csvfile {string} 表示文件路径的字符串
 * @returns data {Array}
 */
function csv_to_tensor(csvfile: string): tf.Tensor{
  let csvstr = fs.readFileSync(csvfile,"utf8",'r+');
  let stringArr = csvstr.split('\r\n') as string[];
  if (stringArr[stringArr.length-1] === "") {
    stringArr.pop();
  }
  let numberArr = [] as number[];
    stringArr.forEach((line: string) => {
    let dataArr = line.split(',');
    dataArr.forEach((data: string) => {
      numberArr.push(Number.parseFloat(data))
    })
  });

  return tf.tensor(numberArr);
}


function processs_data(data: tf.Tensor, v: Number): [trainX:tf.Tensor, trainY:tf.Tensor, testX:tf.Tensor, testY:tf.Tensor] {
  let sample_count = Math.floor(data.size / SAMPLES_PER_GESTURE / COLLECT_DATA_NUM);
  let dataX = data.reshape([sample_count, SAMPLES_PER_GESTURE * COLLECT_DATA_NUM]);
  let validation_count = Math.floor(sample_count * VALIDDATAPORTION)
  let [trainX, testX] = tf.split(dataX, [sample_count - validation_count, validation_count], 0);
  let dataY;
  switch (v) {
    case 0:
      dataY = tf.tensor([1, 0, 0, 0]);
      break;
    case 1:
      dataY = tf.tensor([0, 1, 0, 0]);
      break;
    case 2:
      dataY = tf.tensor([0, 0, 1, 0]);
      break;
    case 3:
      dataY = tf.tensor([0, 0, 0, 1]);
    
  }
  dataY = dataY.tile([sample_count]).reshape([sample_count, 4]);
  let [trainY, testY] = tf.split(dataY, [sample_count * (1-VALIDDATAPORTION), sample_count * VALIDDATAPORTION], 0);
  
  return [trainX, trainY, testX, testY];
}

export function getTrainData(): [trainX:tf.Tensor, trainY:tf.Tensor, testX:tf.Tensor, testY:tf.Tensor] {
  let negative = csv_to_tensor(negativeUrl)
  let [ntrainX, ntrainY, ntestX, ntestY] = processs_data(negative, 0);

  let punch = csv_to_tensor(punchUrl);
  let [ptrainX, ptrainY, ptestX, ptestY] = processs_data(punch, 1);

  let wing = csv_to_tensor(wingUrl)
  let [wtrainX, wtrainY, wtestX, wtestY] = processs_data(wing, 2);
  
  let ring = csv_to_tensor(ringUrl)
  let [rtrainX, rtrainY, rtestX, rtestY] = processs_data(ring, 3);
  

  trainX = tf.concat([ntrainX, ptrainX, wtrainX, rtrainX], 0);
  trainY = tf.concat([ntrainY, ptrainY, wtrainY, rtrainY], 0);
  testX = tf.concat([ntestX, ptestX, wtestX, rtestX], 0);
  testY = tf.concat([ntestY, ptestY, wtestY, rtestY], 0);

  switch (networkType) {
    case NetType.cnn:
      trainX = trainX.reshape([trainX.shape[0], SAMPLES_PER_GESTURE, COLLECT_DATA_NUM, 1]);
      testX = testX.reshape([testX.shape[0], SAMPLES_PER_GESTURE, COLLECT_DATA_NUM, 1]);
      break;
    case NetType.rnn:
      trainX = trainX.reshape([trainX.shape[0], SAMPLES_PER_GESTURE, COLLECT_DATA_NUM]);
      testX = testX.reshape([testX.shape[0], SAMPLES_PER_GESTURE, COLLECT_DATA_NUM]);
      break;
  }

  return [trainX, trainY, testX, testY];
}