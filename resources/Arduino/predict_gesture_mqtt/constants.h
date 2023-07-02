#ifndef CONSTANTS_H_
#define CONSTANTS_H_

// The expected accelerometer data sample frequency
const float kTargetHz = 25;

// The number of expected consecutive inferences for each gesture type
extern const int kConsecutiveInferenceThresholds[4];
#endif  // CONSTANTS_H_