#include <Arduino_LSM6DS3.h>
// Smoothed values
float smoothX = 0;
float smoothY = 0;
// Calibration offsets
float offsetX = 0;
float offsetY = 0;
// Low‑pass filter strength (0.05–0.2 recommended)
float alpha = 0.08;

void setup() {
  Serial.begin(115200);
  if (!IMU.begin()) {
    Serial.println("Failed to initialize IMU!");
    while (1);
  }
  delay(1000);
  float sumX = 0;
  float sumY = 0;
  float x, y, z;

  for (int i = 0; i < 200; i++) {
    if (IMU.accelerationAvailable()) {
      IMU.readAcceleration(x, y, z);
      sumX += x;
      sumY += y;
    }
    delay(5);
  }
  offsetX = sumX / 200.0;
  offsetY = sumY / 200.0;
}

void loop() {
  float x, y, z, totalAcc;
  if (IMU.accelerationAvailable()) {
    IMU.readAcceleration(x, y, z);
    totalAcc = sqrt(sq(x)+ sq(y) +sq(z));
    x -= offsetX;
    y -= offsetY;
    smoothX = smoothX + alpha * (x - smoothX);
    smoothY = smoothY + alpha * (y - smoothY);

    float sendX = smoothX * 1;   // adjust if needed
    float sendY = smoothY * 1.5;

    Serial.print(sendY);  
    Serial.print(",");
    Serial.print(sendX);  
    Serial.print(",");
  }
  delay(20);
}
