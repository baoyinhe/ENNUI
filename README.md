# 开发步骤：
1. 烧写数据采集bin文件
2. 采集4份数据并保存：negative.csv(负样本)、punch.csv(出拳)、wing.csv(画W)、ring.csv(画圆)
3. 上传4份数据
4. 搭建神经网络
5. 修改超参数：epoch、learning_rate、batch_size
6. 开始训练
7. 训练结束，选择一个文件夹保存文件，不要修改文件名
8. 使用tfjs converter将tfjs模型转换成keras模型
  ```
  pip install tensorflowjs

  tensorflowjs_converter --input_format=tfjs_layers_model --output_format=keras ./my-model.json .\keras_model.h5
  ```
9. 将keras模型转换成tflite模型
  ```
  tflite_convert --keras_model_file=keras_model.h5 --output_file=model.tflite
  ```
10. 在git bash命令行将tflite模型输出为model.h头文件
  ```
  xxd -i model.tflite >> model.h
  ```
11. 将model.h头文件放入程序代码的文件夹下，使用Arduino编译并上传至Esp32中



# ENNUI
ENNUI is an Elegant Neural Network User Interface that allows users to:
- Build neural network architectures with a drag and drop interface.
- Train those networks on the browser.
- Visualize the training process.
- Export to Python.

Thanks to Gil Strang, it's hosted at [https://math.mit.edu/ENNUI/](https://math.mit.edu/ENNUI/)

<img src="resources/ennui-resnet-train.png" width="600px"/>

# Installation
After cloning the repo, to install dependencies, run:
`npm install`

To Build the app, run:
`npm run build`

For Continuous Build and Integration, run:
`npm run watch`

To use chrome with localhost and the CIFAR-10 Dataset, make sure to close
all chrome windows and run the following command to launch chrome:
'path/to/chrome.exe --allow-file-access-from-files'

# Code Structure
ENNUI is frontend-only. The implementation is structed in two parts:
- `ENNUI/src/ui` is home to the traditional frontend components such as the styling, the button logic, and the draggable components (e.g. the layers and activations).
- `ENNUI/src/model` is the "backend" implementation supporting core functionality such as building neural networks, doing the code generation, and saving the state in the browser. 


