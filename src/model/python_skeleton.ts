import { setModelHyperparameters } from "../ui/app";
import { NUM_CLASSES } from "./data";
import { model } from "./params_object";
import { networkType } from "./model";

export function pythonSkeleton(modelCode: string): string {
    setModelHyperparameters();
    return `from __future__ import print_function
import tensorflow as tf
import tensorflow.keras as keras
import tensorflow.keras.layers as layers
import numpy as np
import pandas as pd

def processData(d, v):
    dataX = np.empty([0,SAMPLES_PER_GESTURE*6])
    dataY = np.empty([0])

    data  = d.values
    dataNum = data.shape[0] // SAMPLES_PER_GESTURE


    for i in tqdm(range(dataNum)):
        tmp = []
        for j in range(SAMPLES_PER_GESTURE):
            tmp += [(data[i * SAMPLES_PER_GESTURE + j][0] + 78.4) / 156.8]
            tmp += [(data[i * SAMPLES_PER_GESTURE + j][1] + 78.4) / 156.8]
            tmp += [(data[i * SAMPLES_PER_GESTURE + j][2] + 78.4) / 156.8]
            tmp += [(data[i * SAMPLES_PER_GESTURE + j][3] + 4.5) / 9.0]
            tmp += [(data[i * SAMPLES_PER_GESTURE + j][4] + 4.5) / 9.0]
            tmp += [(data[i * SAMPLES_PER_GESTURE + j][5] + 4.5) / 9.0]

        tmp = np.array(tmp)

        tmp = np.expand_dims(tmp, axis = 0)

        dataX = np.concatenate((dataX, tmp), axis = 0)
        dataY = np.append(dataY, v)

    return dataX, dataY

negative = pd.read_csv('data/negative.csv', header = None)
punch = pd.read_csv('data/punch.csv', header = None)
wing = pd.read_csv('data/wing.csv', header = None)
ring = pd.read_csv('data/ring.csv', header = None)

SAMPLES_PER_GESTURE = 50

negativeX, negativeY = processData(negative, 0)
punchX, punchY = processData(punch, 1)
wingX, wingY = processData(wing, 2)
ringX, ringY = processData(ring, 3)

dataX = np.concatenate((negativeX, punchX, wingX, ringX), axis = 0)
dataY = np.concatenate((negativeY, punchY, wingY, ringY), axis = 0)

permutationTrain = np.random.permutation(dataX.shape[0])
dataX = dataX[permutationTrain]
dataY = dataY[permutationTrain]

vfoldSize = int(dataX.shape[0]/100*20)

xTest = dataX[0:vfoldSize]
yTest = dataY[0:vfoldSize]
xTest = np.array(xTest).reshape(vfoldSize,SAMPLES_PER_GESTURE,6)

xTrain = dataX[vfoldSize:dataX.shape[0]]
yTrain = dataY[vfoldSize:dataY.shape[0]]
xTrain = np.array(xTrain).reshape(dataX.shape[0]-vfoldSize,SAMPLES_PER_GESTURE,6)

batch_size = ${model.params.batchSize}
num_classes = ${NUM_CLASSES}
epochs = ${model.params.epochs}

print('xTrain shape:', xTrain.shape)
print(xTrain.shape[0], 'train samples')
print(xTest.shape[0], 'test samples')

if ${networkType} == 0:
    input_shape = (SAMPLES_PER_GESTURE * 6)
elif ${networkType} == 1:
    input_shape = (SAMPLES_PER_GESTURE, 6, 1)
elif ${networkType} == 2:
    input_shape = (SAMPLES_PER_GESTURE, 6)


############################# Architecture made by Ennui
${modelCode}
#############################

model.compile(loss=keras.losses.${model.params.getPythonLoss()},
              optimizer=keras.optimizers.${model.params.getPythonOptimizer()}(lr=${model.params.learningRate}),
              metrics=['accuracy'])

model.fit(xTrain, yTrain,
          batch_size=batch_size,
          epochs=epochs,
          verbose=1,
          validation_data=(xTest, yTest))
score = model.evaluate(xTest, yTest, verbose=0)
print('Test loss:', score[0])
print('Test accuracy:', score[1])
`;
}
