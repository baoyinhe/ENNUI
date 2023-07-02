#include "constants.h"

// The number of expected consecutive inferences for each gesture type.
// These defaults were established with the SparkFun Edge board.
const int kConsecutiveInferenceThresholds[4] = {1, 3, 5, 5};