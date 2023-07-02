#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>

#define LED_BUILTIN 2

// MPU6050数据采集程序
// 初始蓝灯闪烁5下，停顿3秒后开始进行数据采集
// 蓝灯亮时采集数据，蓝灯灭时停止采集

const int record_num_per_sample=50; // 单个样本的长度, 采样率为25Hz，即1s采集25个数据，50个数据的采样时间为2s
const int sample_num=50; //运行一次程序收集的样本数量
int data_count=0;

Adafruit_MPU6050 mpu;
int threshold = 40;
bool touchdetected = false;
long last_sample_millis = 0;

sensors_event_t a, g, temp;

float aX, aY, aZ, gX, gY, gZ,yX,yY,yZ;
int record_count=0;

float record_aX[300];
float record_aY[300];
float record_aZ[300];

float record_gX[300];
float record_gY[300];
float record_gZ[300];


void blink() {
  for (int i = 0; i < 5; ++i) {
    digitalWrite(LED_BUILTIN, HIGH);
    delay(100);
    digitalWrite(LED_BUILTIN, LOW);
    delay(100);
  }
}

void getTouch(){
 touchdetected = true;
}

void setup(){
  Serial.begin(115200);
  while (!Serial)
    delay(10); // will pause Zero, Leonardo, etc until serial console opens

  // Try to initialize!
  if (!mpu.begin()) {
    Serial.println("Failed to find MPU6050 chip");
    while (1) {
      delay(10);
    }
  }

  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_2000_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_10_HZ);
  mpu.setSampleRateDivisor(39);

  // touchAttachInterrupt(T0, getTouch, threshold);

  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW);

  record_count=-1; //防止第一次数据的错误触发
  blink();
  delay(3000);
}

void loop(){
  // if (touchdetected) {
  //   esp_deep_sleep_start();
  // }

  if ((millis() - last_sample_millis) < 40) {
    return;
  }
  last_sample_millis = millis();
  
  mpu.getEvent(&a, &g, &temp);

  aX = a.acceleration.x;
  aY = a.acceleration.y;
  aZ = a.acceleration.z;

  gX = g.gyro.x;
  gY = g.gyro.y;
  gZ = g.gyro.z;

  if (record_count==-1)
  {
    record_count=0;
    digitalWrite(LED_BUILTIN, HIGH);
    data_count++;
    if(data_count>sample_num){
      blink();
      esp_deep_sleep_start();
    }
  }

  if(record_count<record_num_per_sample&&record_count!=-1)//收集record_num_per_sample个元组数据
  {
    record_aX[record_count]=aX;
    record_aY[record_count]=aY;
    record_aZ[record_count]=aZ;
    record_gX[record_count]=gX;
    record_gY[record_count]=gY;
    record_gZ[record_count]=gZ;
    record_count++;
  }

  if(record_count==record_num_per_sample)//收集完成一次动作的record_num_per_sample个元组数据
  {
      for(int k=0;k<record_count;k++){
        Serial.print(record_aX[k]);
        Serial.print(",");
        Serial.print(record_aY[k]);
        Serial.print(",");
        Serial.print(record_aZ[k]);
        Serial.print(",");
        Serial.print(record_gX[k]);
        Serial.print(",");
        Serial.print(record_gY[k]);
        Serial.print(",");
        Serial.print(record_gZ[k]);
        Serial.println("");
      }
      Serial.println("");
      record_count=-1;
      digitalWrite(LED_BUILTIN, LOW);
      delay(2000);
  }
}
