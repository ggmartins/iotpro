# iotpro
 Serverless Application for IoT Device Managing and Profiling

![Slide1](https://github.com/ggmartins/iotpro/blob/master/images/slide1.png?raw=true)<br />
![Slide2](https://github.com/ggmartins/iotpro/blob/master/images/slide2.png?raw=true)<br />
![Slide3](https://github.com/ggmartins/iotpro/blob/master/images/slide3.png?raw=true)<br />

### Build & Deploy

#### Serverless Backend
- <b>npm install</b>
- <b>edit config.dev.json</b> (copy from template config.template.dev.json adding password to JWS_TOKEN and SHARED_KEY, both can be base64 encoded of plain text
- <b>SLS_DEBUG=* sls deploy</b>
- <b>Offline</b><br />
enable ENABLE_LOCAL in <b>serverless.yml</b> <br />
SLS_DEBUG=* sls offline start</b> (offline execution) <br />
sls dynamodb start --seed test --migrate</b> (offline execution) <br />

#### iotmon Golang Client

cd iotmon/src/iotmon <br />
make dep && make <br />
edit iotmon.config.json (adjust url, shared key to match SHARED_KEY in the server, and status: enable <br />
./iotmon<br />


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

Expected Output:

```
./iotmon (running first time)

2020/06/14 16:28:19 Initializing...
2020/06/14 16:28:19 INFO: NEW EXECUTION, renaming old ./iotmon.status.yaml to ./iotmon.status.backup.
2020/06/14 16:28:19 Done.
2020/06/14 16:28:19 Using key: [dGh****g==]
05ac:027a - Apple Inc. Apple Internal Keyboard / Trackpad
05ac:8103 - Apple Inc. Headset
05ac:8262 - Apple Inc. Ambient Light Sensor
05ac:8514 - Apple Inc. FaceTime HD Camera (Built-in)
05ac:8233 - Apple Inc. Apple T2 Controller
05ac:027a - Apple Inc. Apple T2 Bus
2020/06/14 16:28:21 Done.
default route iface:f2:18:98:58:42:64
routeIp: 10.0.0.1
2020/06/14 16:28:21 Finished.
30356163-3a30-4237-a130-3561633a3032
30356163-3a38-4130-b330-3561633a3831
30356163-3a38-4236-b230-3561633a3832
30356163-3a38-4531-b430-3561633a3835
30356163-3a38-4233-b330-3561633a3832
Creating Device:66323a31-383a-4938-ba35-383a34323a36
Password:asdf
Repeat password:asdf
2020/06/14 16:28:24 POST Device Create "201 Created"
2020/06/14 16:28:25 Token: "200 OK" {"message":"eyJ..." <--- jwt token
2020/06/14 16:28:25 POST Status Created. "201 Created"

./iotmon (running second time)

2020/06/14 16:28:32 Initializing...
2020/06/14 16:28:32 Done.
2020/06/14 16:28:32 Using key: [dGh****g==]
05ac:027a - Apple Inc. Apple Internal Keyboard / Trackpad
05ac:8103 - Apple Inc. Headset
05ac:8262 - Apple Inc. Ambient Light Sensor
05ac:8514 - Apple Inc. FaceTime HD Camera (Built-in)
05ac:8233 - Apple Inc. Apple T2 Controller
05ac:027a - Apple Inc. Apple T2 Bus
2020/06/14 16:28:33 Done.
default route iface:f2:18:98:58:42:64
routeIp: 10.0.0.1
2020/06/14 16:28:33 Finished.
30356163-3a38-4531-b430-3561633a3835
30356163-3a38-4233-b330-3561633a3832
30356163-3a30-4237-a130-3561633a3032
30356163-3a38-4130-b330-3561633a3831
30356163-3a38-4236-b230-3561633a3832
2020/06/14 16:28:33 INFO: using [./iotmon.status.yaml] with timestamp: 2020-06-14T16:28:21-05:00 as cached.
2020/06/14 16:28:33 PUT Status "200 OK"
```
