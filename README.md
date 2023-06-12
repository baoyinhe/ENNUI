# 开发步骤：
1. 烧写数据采集bin文件
2. 采集4份数据并保存：negative.csv(负样本)、punch.csv(出拳)、wing.csv(画W)、ring.csv(画圆)
3. 上传4份数据
4. 搭建神经网络
5. 修改超参数：epoch、learning_rate、batch_size
6. 开始训练
7. 训练结束，选择一个文件夹保存文件，不要修改文件名
8. 使用tfjs converter将tfjs模型转换成keras模型
  - 在cmd终端安装tensorflow和tensorflowjs
  ```bash
  pip install tensorflow==2.9.0
  pip install tensorflowjs==3.19.0
  ```
  - 使用命令行转换或使用软件'导出tflite'按键
  ```bash
  tensorflowjs_converter --input_format=tfjs_layers_model --output_format=keras ./my-model.json ./keras_model.h5
  ```
9. 将keras模型转换成tflite模型
  ```bash
  tflite_convert --keras_model_file=keras_model.h5 --output_file=model.tflite
  ```
10.  在git bash命令行将tflite模型输出为model.h头文件
  ```bash
  xxd -i model.tflite >> model.h
  ```
11.  将model.h头文件放入程序代码的文件夹下，使用Arduino编译并上传至Esp32中
    

转换命令集合
```
# 用户目录下的Downloads文件夹
tensorflowjs_converter --input_format=tfjs_layers_model --output_format=keras %UserProfile%/Downloads/my-model.json %UserProfile%/Downloads/keras_model.h5 && tflite_convert --keras_model_file=%UserProfile%/Downloads/keras_model.h5 --output_file=%UserProfile%/Downloads/model.tflite

# 非量化：（D盘）
tensorflowjs_converter --input_format=tfjs_layers_model --output_format=keras D:/my-model.json D:/keras_model.h5 && tflite_convert --keras_model_file=D:/keras_model.h5 --output_file=D:/model.tflite

# 量化： （D盘）
tensorflowjs_converter --input_format=tfjs_layers_model --output_format=keras --quantize_uint8 [QUANTIZE_UINT8] D:/my-model.json D:/keras_quant_model.h5 && tflite_convert --keras_model_file=D:/keras_quant_model.h5 --output_file=D:/model.tflite

```

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


