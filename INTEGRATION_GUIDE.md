# 🚨 Technical Integration Guide: GIS SOS Emergency System
### Global Emergency Network | Version 1.0.0

This document is the official technical manual for developers integrating **Physical SOS Poles**, **Hardware Switches**, or **Remote Servers** with the GIS SOS Emergency Dashboard.

---

## 1. System Architecture
The system utilizes a **Real-Time Global Message Broker** (Firebase Firestore). All signals are routed through a secure cloud layer to the monitoring dashboard instantly.

```mermaid
graph LR
    A[Physical SOS Pole] -->|WiFi/GSM| B[Firebase Cloud]
    C[Hardware Switch] -->|API Call| B[Firebase Cloud]
    D[Background Server] -->|SDK Push| B[Firebase Cloud]
    B -->|Real-Time Sync| E[Monitoring Dashboard]
    E -->|Alert| F[Operator/Dispatch]
```

---

## 2. API Credentials (Target Environment)
Use these specific credentials to connect your device or server to the emergency network.

| Parameter | Value |
| :--- | :--- |
| **Project ID** | `new786970` |
| **API Key** | `AIzaSyB_sJQwf56lmZoJf0ciO95KIgV8bE9NwVM` |
| **Collection Name** | `sos_alerts` |
| **Auth Domain** | `new786970.firebaseapp.com` |

---

## 3. Data Schema (Requirements)
To trigger an SOS on the GIS Map, you must push a JSON object to the `sos_alerts` collection with the following fields:

```json
{
  "name": "Pole Name or ID",         // Example: "SOS-POLE-WARD-05"
  "ward": "Ward Number",            // Example: "5"
  "lat": 25.2427,                   // Latitude of the physical node
  "lng": 86.7352,                   // Longitude of the physical node
  "triggerTime": 1712415123456,     // Unix timestamp in milliseconds
  "alertId": "UNIQUE_ID"            // Optional string for tracking
}
```

---

## 4. Integration Code Samples

### A. Direct REST API (For IoT/Hardware)
If your device does not support an SDK, use a direct HTTP POST request.
**Endpoint**: `https://firestore.googleapis.com/v1/projects/new786970/databases/(default)/documents/sos_alerts`

```bash
curl -X POST "https://firestore.googleapis.com/v1/projects/new786970/databases/(default)/documents/sos_alerts" \
-H "Content-Type: application/json" \
-d '{
  "fields": {
    "name": {"stringValue": "Testing-Switch-01"},
    "ward": {"stringValue": "5"},
    "lat": {"doubleValue": 25.2444},
    "lng": {"doubleValue": 86.7344},
    "triggerTime": {"integerValue": "1712415123456"}
  }
}'
```

### B. Python (For AI/Background Servers)
```python
import firebase_admin
from firebase_admin import credentials, firestore
import time

# 1. Initialize with Service Account Key
cred = credentials.Certificate("firebase-adminsdk.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# 2. Trigger Function
def trigger_emergency(location_name, ward, lat, lng):
    sos_data = {
        'name': location_name,
        'ward': str(ward),
        'lat': float(lat),
        'lng': float(lng),
        'triggerTime': int(time.time() * 1000)
    }
    db.collection('sos_alerts').add(sos_data)
    print("Emergency Signal Transmitted Successfully.")
```

### C. Node.js (For Web Services)
```javascript
const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'new786970' });
const db = admin.firestore();

async function sendSOSSignal() {
    await db.collection('sos_alerts').add({
        name: 'Pole Alpha',
        ward: '12',
        lat: 25.2444,
        lng: 86.7344,
        triggerTime: Date.now()
    });
}
```

---

## 5. Deployment & Testing
1.  **Test Signal**: Run the CURL command above.
2.  **Verification**: Open the dashboard. If successful:
    -   Alarm will sound.
    -   Red full-screen overlay will appear.
    -   Map will auto-focus on the GPS coordinates provided.
3.  **Hardware Connection**: Connect your physical switch to a GPIO pin, and call the trigger function on **Falling Edge (Interrupt)**.

---
*Official Technical Specification - Nagar Parishad Sultanganj GIS Project*
