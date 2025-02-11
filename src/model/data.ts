import * as tf from "@tensorflow/tfjs";
import { networkType, NetType } from "./model";
import { displayError } from "../ui/error";
var fs = require("fs");

let negativeUrl: string;
let punchUrl: string;
let ringUrl: string;
let wingUrl: string;

export const SAMPLES_PER_GESTURE = 50;
export const COLLECT_DATA_NUM = 6;
export const VALIDDATAPORTION = 0.2;
export const NUM_CLASSES = 4;

export let trainX: tf.Tensor;
export let trainY: tf.Tensor;
export let testX: tf.Tensor;
export let testY: tf.Tensor;

export function loadDataUrl(dataType: string): void {
  let fileObj: any;
  let filePath: string;
  let selectedfile: HTMLInputElement;
  switch (dataType) {
    case "negativeUrl":
      fileObj = (document.getElementsByName("negativeInput")[0] as any).files[0];
      filePath = fileObj.path;
      selectedfile = document.getElementById("negativeFile") as HTMLInputElement;
      selectedfile.value = filePath;
      negativeUrl = selectedfile.value;
      // console.log('negativeUrl:' + `${negativeUrl}`);
      break;
    case "punchUrl":
      fileObj = (document.getElementsByName("punchInput")[0] as any).files[0];
      filePath = fileObj.path;
      selectedfile = document.getElementById("punchFile") as HTMLInputElement;
      selectedfile.value = filePath;
      punchUrl = selectedfile.value;
      // console.log('punchUrl:' + `${punchUrl}`);
      break;
    case "wingUrl":
      fileObj = (document.getElementsByName("wingInput")[0] as any).files[0];
      filePath = fileObj.path;
      selectedfile = document.getElementById("wingFile") as HTMLInputElement;
      selectedfile.value = filePath;
      wingUrl = selectedfile.value;
      // console.log('wingUrl:' + `${wingUrl}`);
      break;
    case "ringUrl":
      fileObj = (document.getElementsByName("ringInput")[0] as any).files[0];
      filePath = fileObj.path;
      selectedfile = document.getElementById("ringFile") as HTMLInputElement;
      selectedfile.value = filePath;
      ringUrl = selectedfile.value;
      // console.log('ringUrl:' + `${ringUrl}`);
      break;
  }
}

/** 
 * @param csvfile {string} 表示文件路径的字符串
 * @returns data {Array}
 */
function csv_to_tensor(csvfile: string): tf.Tensor{
  try {
    let csvstr = fs.readFileSync(csvfile,"utf8",'r+');
    let stringArr = csvstr.split('\r\n') as string[];
    if (stringArr[stringArr.length-1] === "") {
      stringArr.pop();
    }
    let numberArr = [] as number[];
      stringArr.forEach((line: string) => {
        let dataArr = line.split(',');
        if (dataArr.length === COLLECT_DATA_NUM) {
          dataArr.forEach((data: string) => {
            numberArr.push(Number.parseFloat(data))
          })
        }
      });
    return tf.tensor(numberArr);
  } catch (err: any){
    displayError(err);
    return tf.tensor([]);
  }
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
  let [trainY, testY] = tf.split(dataY, [sample_count - validation_count, validation_count], 0);
  
  return [trainX, trainY, testX, testY];
}

export function getTrainData(): [trainX: tf.Tensor, trainY: tf.Tensor, testX: tf.Tensor, testY: tf.Tensor] {
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
    case NetType.mlp:
      break;
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