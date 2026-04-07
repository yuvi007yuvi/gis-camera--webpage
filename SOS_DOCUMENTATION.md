# SOS Alert Receive Feature Documentation

## 1. Overview
The **SOS Alert Receive** feature is a critical safety component of the GIS CCTV Monitoring Dashboard. It allows the administrative portal to receive real-time emergency signals from field-deployed SOS boxes or camera points, providing immediate visual and audible notification to the dashboard operators.

## 2. Key Capabilities
- **Real-time Notifications**: Immediate full-screen overlay when an alert is received.
- **Audible Alarm**: High-priority siren sound to catch operator attention (can be muted).
- **Precise Location**: Automatic map centering and high-visibility pulsing beacon on the emergency point.
- **Live Feed Access**: Instant access to the nearest camera's live stream.
- **Dispatch Integration**: One-click navigation to the site via Google Maps for field teams.
- **Alert History**: Persistent log of all received alerts during the session.

---

## 3. UI/UX Design

### A. SOS Overlay (`#sos-alert-overlay`)
A premium, semi-transparent glassmorphic overlay that covers the dashboard when an alert is active. It features:
- **Red Pulsing Header**: Indicates high-priority emergency.
- **Details Grid**: Shows Camera Name, Ward No, Coordinates, and Timestamp.
- **Live Feed Preview**: Displays a snapshot or feed from the camera associated with the SOS point.

### B. Map Interaction
When an alert triggers:
- The map automatically pans to the SOS coordinates.
- A custom **Pulsing Marker** (red) is added to the map at the exact location.
- The zoom level is increased to 18 for high-detail area viewing.

---

## 4. Technical Implementation

### Frontend Logic (`script.js`)
The core logic resides in the `triggerSOSAlert(cameraInfo)` function:
1.  **Audio Engine**: Uses the HTML5 `<audio>` API to play a looped siren.
2.  **DOM Manipulation**: Populates the overlay with metadata from the `cameraInfo` object.
3.  **Leaflet Integration**: Creates a `L.divIcon` with CSS animations for the pulsing map effect.
4.  **State Management**: Adds the alert to an internal `sosAlerts` array and updates the "SOS History" modal.

### Integration with Backend (Firebase)
To enable production-ready real-time alerts, follow these steps:

1.  **Firestore Listener**:
    ```javascript
    import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
    
    // collection name: "sos_alerts"
    const sosCollection = collection(db, "sos_alerts");
    const q = query(sosCollection, orderBy("timestamp", "desc"));
    
    onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
                const alertData = change.doc.data();
                // Find matching camera in cameraData
                const cam = cameraData.find(c => c.name === alertData.cameraName);
                if (cam) triggerSOSAlert(cam);
            }
        });
    });
    ```

---

## 5. Testing the Feature

### Option A: Internal Test Trigger
For quick demonstration within the dashboard:
1.  Locate the **SOS System** stat card.
2.  Click the small **"TEST"** button in the lower-right corner.
3.  The emergency workflow will trigger immediately.

### Option B: Realistic Cross-Tab Simulation (Recommended)
This method simulates a signal arriving from a separate field device:
1.  Open **`index.html`** in your primary browser tab.
2.  Open **`test-sender.html`** in a second tab.
3.  On the **Field Simulator (test-sender.html)**:
    - Select any camera/location from the dropdown.
    - Click the large **"BROADCAST SOS"** button.
4.  Switch to the dashboard tab. You will see the incoming alert precisely mapped to the selected camera, the alarm sounding, and the history being updated.

---
*Prepared for Nagar Parishad Sultanganj GIS Project*

