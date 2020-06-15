# iotpro
 Serverless Application for IoT Device Managing and Profiling

```
Serverless API local deployment:

offline: Offline [http for lambda] listening on http://localhost:3002
offline: Configuring Authorization: dev AuthIoT
[offline] Creating Authorization scheme for CreateDevice-AuthIoT-POST-dev
offline: Configuring Authorization: dev/login AuthIoT
[offline] Creating Authorization scheme for LoginDevice-AuthIoT-POST-dev/login
offline: Configuring Authorization: iot/status/{id} AuthIoT
[offline] Creating Authorization scheme for IoTPut-AuthIoT-PUT-iot/status/{id}
offline: Configuring Authorization: iot/status/{id} AuthIoT
[offline] Creating Authorization scheme for IoTGet-AuthIoT-GET-iot/status/{id}
offline: Configuring Authorization: iot/status AuthIoT
[offline] Creating Authorization scheme for IoTPost-AuthIoT-POST-iot/status
offline: Configuring Authorization: iot/status/{id} AuthIoT
[offline] Creating Authorization scheme for IoTDelete-AuthIoT-DELETE-iot/status/{id}
offline: Configuring Authorization: iot/upload/{id}/attachment AuthIoT
[offline] Creating Authorization scheme for GenerateUploadUrl-AuthIoT-GET-iot/upload/{id}/attachment

   ┌───────────────────────────────────────────────────────────────────────────────────────┐
   │                                                                                       │
   │   POST   | http://localhost:3000/dev/dev                                              │
   │   POST   | http://localhost:3000/2015-03-31/functions/CreateDevice/invocations        │
   │   POST   | http://localhost:3000/dev/dev/login                                        │
   │   POST   | http://localhost:3000/2015-03-31/functions/LoginDevice/invocations         │
   │   PUT    | http://localhost:3000/dev/iot/status/{id}                                  │
   │   POST   | http://localhost:3000/2015-03-31/functions/IoTPut/invocations              │
   │   GET    | http://localhost:3000/dev/iot/status/{id}                                  │
   │   POST   | http://localhost:3000/2015-03-31/functions/IoTGet/invocations              │
   │   POST   | http://localhost:3000/dev/iot/status                                       │
   │   POST   | http://localhost:3000/2015-03-31/functions/IoTPost/invocations             │
   │   DELETE | http://localhost:3000/dev/iot/status/{id}                                  │
   │   POST   | http://localhost:3000/2015-03-31/functions/IoTDelete/invocations           │
   │   GET    | http://localhost:3000/dev/iot/upload/{id}/attachment                       │
   │   POST   | http://localhost:3000/2015-03-31/functions/GenerateUploadUrl/invocations   │
   │                                                                                       │
   └───────────────────────────────────────────────────────────────────────────────────────┘
   ```
