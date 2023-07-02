#include <TensorFlowLite_ESP32.h>

#include "model.h"
#include "gesture_predictor.h"
#include <tensorflow/lite/experimental/micro/kernels/all_ops_resolver.h>
#include <tensorflow/lite/experimental/micro/micro_error_reporter.h>
#include <tensorflow/lite/experimental/micro/micro_interpreter.h>
#include <tensorflow/lite/schema/schema_generated.h>
#include <tensorflow/lite/version.h>

#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>

#include <WiFi.h>
#include <MQTTPubSubClient.h>
#include <ArduinoJson.h>


#define LED_BUILTIN 2

const char* MQTT_Broker_IP = "";  // 根据实际情况修改
const char * ssid = "";           // 根据实际情况修改
const char * password = "";       // 根据实际情况修改

unsigned long start, end, dure;

Adafruit_MPU6050 mpu;
sensors_event_t a, g, temp;

int begin_index = 0;
float save_data[600] = {0.0};
bool pending_initial_data = true;
long last_sample_millis = 0;

namespace {
tflite::MicroErrorReporter tflErrorReporter;
tflite::ops::micro::AllOpsResolver tflOpsResolver;

const tflite::Model* tflModel = nullptr;
tflite::MicroInterpreter* tflInterpreter = nullptr;
TfLiteTensor* tflInputTensor = nullptr;
int input_length;
TfLiteTensor* tflOutputTensor = nullptr;
int output_length;

constexpr int tensorArenaSize = 20 * 1024;
byte tensorArena[tensorArenaSize];

// Whether we should clear the buffer next time we fetch data
bool should_clear_buffer = false;
}

const char* GESTURES[] = {
  "negative",
  "gesture1",
  "gesture2",
  "gesture3"
};
#define NUM_GESTURES (sizeof(GESTURES) / sizeof(GESTURES[0]))

WiFiClient client;
MQTTPubSubClient mqtt;

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

  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW);

  WiFi.begin(ssid, password);
  while(WiFi.status()!=WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println("");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
  delay(1000);

  // MQTT configure
  // connect to host
  client.connect(MQTT_Broker_IP, 1883);
  // initialize mqtt client
  mqtt.begin(client);
  // connect to mqtt broker
  mqtt.connect("esp32", "", "");

  tflModel = tflite::GetModel(model_tflite);
  if (tflModel->version() != TFLITE_SCHEMA_VERSION) {
    Serial.println("Model schema mismatch!");
    while (1);
  }
  tflInterpreter = new tflite::MicroInterpreter(tflModel, tflOpsResolver, tensorArena, tensorArenaSize, &tflErrorReporter);
  tflInterpreter->AllocateTensors();
  tflInputTensor = tflInterpreter->input(0);
  tflOutputTensor = tflInterpreter->output(0);

  input_length = tflInputTensor->bytes / sizeof(float);
  output_length = tflOutputTensor->bytes / sizeof(float);

  mqtt.subscribe("gesture", [](const String& payload, const size_t size) {
      Serial.print("publish gesture=");
      Serial.println(payload);
  });
}

void loop(){
  mqtt.update();
  if (!mqtt.isConnected()) {
    Serial.println("Reconnect......");
    // connect to host
    client.connect(MQTT_Broker_IP, 1883);
    // initialize mqtt client
    mqtt.begin(client);
    // connect to mqtt broker
    mqtt.connect("esp32", "", "");
  }
  // Attempt to read new data from the accelerometer
  bool got_data = ReadAccelerometer(tflInputTensor->data.f,
                                    input_length, should_clear_buffer);
  // Don't try to clear the buffer again
  should_clear_buffer = false;
  // If there was no new data, wait until next time
  if (!got_data) return;
  // Run inference, and report any error
  TfLiteStatus invoke_status = tflInterpreter->Invoke();
  if (invoke_status != kTfLiteOk) {
    Serial.print("Invoke failed\n");
    return;
  }

  uint8_t gesture_index = PredictGesture(tflOutputTensor->data.f, output_length);
  should_clear_buffer = gesture_index > 0;  // 当检测出手势时清空buffer

  String json="";
  DynamicJsonDocument jsonobj(1024); 
  for (int i = 0; i < NUM_GESTURES; i++) {
    jsonobj[GESTURES[i]] = tflOutputTensor->data.f[i];
  }
  jsonobj["result"] = gesture_index;
  serializeJson(jsonobj, json);
  if (should_clear_buffer) {
    Serial.println(json);
    mqtt.publish("gesture", String(gesture_index));
  }
}

static bool UpdateData() {
  bool new_data = false;
  if ((millis() - last_sample_millis) < 40) {
    return false;
  }
  last_sample_millis = millis();

  mpu.getEvent(&a, &g, &temp);

  save_data[begin_index++] = a.acceleration.x;
  save_data[begin_index++] = a.acceleration.x;
  save_data[begin_index++] = a.acceleration.z;
  save_data[begin_index++] = g.gyro.x;
  save_data[begin_index++] = g.gyro.y;
  save_data[begin_index++] = g.gyro.z;

  if (begin_index >= 600) {
    begin_index = 0;
  }
  new_data = true;

  return new_data;
}

bool ReadAccelerometer(float* input,
                       int length, bool reset_buffer) {
  if (reset_buffer) {
    memset(save_data, 0, 600 * sizeof(float));
    begin_index = 0;
    pending_initial_data = true;
  }

  if (!UpdateData()) {
    return false;
  }

  if (pending_initial_data && begin_index >= length) {
    pending_initial_data = false;
  }

  if (pending_initial_data) {
    return false;
  }

  for (int i = 0; i < length; ++i) {
    int ring_array_index = begin_index + i - length;
    if (ring_array_index < 0) {
      ring_array_index += 600;
    }
    input[i] = save_data[ring_array_index];
  }
  return true;
}
