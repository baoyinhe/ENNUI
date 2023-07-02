# 开发配置
node.js版本为v14.19.3

After cloning the repo, to install dependencies, run:
`npm install`

To run the app:
`npm run start`

To Build the app, run:
`npm run build`

Package：
`npm run package`
注意打包前先run build后run package，同时，发布版需要注释app.ts第200行代码，同时取消注释第203行代码。

# 目录结构
├─resources  
│  ├─Arduino                    感知终端Arduino代码
│  │  ├─get_training_data       数据采集阶段代码
│  │  └─predict_gesture_mqtt    模型推理阶段代码
│  ├─data                       出拳、画W、画圆数据集
│  ├─EspEasy                    EspEasy固件
│  └─MQTT                       MQTT安装简介
├─src                           源码
│   ├─model                     网络模型
│   └─ui                        界面
├─index.html                    主界面
├─main.js                       Electron入口文件
└─requirements.txt              python环境

# 环境准备
## Arduino
1. 安装Arduino IDE
   https://blog.csdn.net/qq_28877125/article/details/107122264
2. 在ArduinoIDE安装以下库：
   -  WebSockets_Generic 2.14.2
   -  MQTTPubSubClient 0.1.3
   -  TensorFlowLite_Esp32 0.8.0
   -  Adafruit TensorFlow Lite 1.2.0
   -  Adafruit MPU6050 2.2.3
   -  Adafruit Unified Sensor 1.1.7
   -  ArduinoJson 6.18.5

## Anaconda
1. 安装Anaconda https://blog.csdn.net/fan18317517352/article/details/123035625
2. 配置环境变量，添加以下路径至 “系统变量-Path”
   -  anaconda3
   -  anaconda3\Scripts
   -  anaconda3\Library\bin
3. 创建Python TensorFlow环境
   ```
   conda create -n tf python=3.8
   conda activate tf
   ```
4. 安装tensorflow库
   ```
   pip install -r requirements.txt
   ```

## MQTT
根据resources\MQTT\mqtt-mosquitto.pptx文档配置

# 使用流程
## 阶段一：数据采集
1. 将resorces\Arduino\get_training_data中的代码烧写到感知终端（蛋壳），关闭Arduino IDE
2. 点击“刷新设备”，选择端口号，硬件按EN重启ESP32，点击“连接设备”，ESP32上的灯快闪5s后，再次等待蓝灯亮起即可采集数据，蓝灯灭时停止采集。默认程序运行一次采集50个样本。(注意设备重启后再点击连接设备按钮，否则出错)
3. 点击“保存数据”即可讲监视器中的数据下载到本地csv文件。每次采集完可以点击“清空面板”进行数据清空。一共采集4份数据并命名保存，例如negative.csv(负样本)、punch.csv(出拳)、wing.csv(画W)、ring.csv(画圆)
4. 分别上传4份数据

## 阶段二：模型搭建
1. 切换到“网络模型构建”界面
2. 点击左侧网络层和右侧参数进行网络配置，模板为MLP和CNN

## 阶段三：模型训练
1. 切换到“模型训练”界面
2. 配置优化器、超参数
3. 点击右上角“Train”开始训练
4. 训练结束后将模型文件（my-model.json 和 my-model.weights.bin）保存至本地，注意不能修改文件名

## 阶段四：模型导出为能运行在ESP32上的model.h文件
1. 点击“选择模型文件”，选择训练好的my-model.json文件
2. 点击“导出tflite”，最终在resources\Arduino\predict_gesture_mqtt目录下生成model.h
3. 双击predict_gesture_mqtt.ino，在Arduino IDE中打开项目文件，修改MQTT_Broker_IP、ssid、password，将代码烧写到ESP32运行

## 阶段五：手势识别
1. 开启PC上的mqtt服务
2. 打开Arduino的串口监视器，做出手势，串口显示器能显示识别结果

与机器人联动：
1. 机器人烧录EspEasy固件(resources\EspEasy\ESP_Easy_mega_20211105_normal_ESP8266_4M1M.bin)
2. 机器人进行网络、MQTT配置（与感知终端在同一局域网）、硬件设备配置，并编写对应的Rules
3. 挥动手势控制机器人执行不同行为


# 硬件
1. ESP32
2. MPU6050
3. 电池

Pins Connection
| D    | GPIO | Function               | Default      |
| ---- | ---- | ---------------------- | ------------ |
| D22  | 16   | MPU6050 I2C SCL        |              |
| D21  | 5    | MPU6050 I2C SDA        |              |

[硬件购买链接](./Hardware_purchase_link.xlsx)

# TODO
1. 将get_training_data.ino直接编译成bin文件
2. 由于MLP[300]和CNN[50,6,1]网络的输入维度不同，所以在训练前应该检测模型的类型，然后对输入数据进行reshape。目前的做法是，当点击CNN模板，则自动reshape为[50,6,1]，当点击MLP模板，reshape为[300]。更好的办法是在训练之前，对前几个网络层进行检测，如果类型是Convolution，则切换为CNN的输入维度，否则切换为MLP的输入维度。
