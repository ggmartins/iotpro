# iotpro
 Serverless Application for IoT Device Managing and Profiling


# iotpro
 Serverless Application for IoT Device Managing and Profiling
 
![Slide1](https://github.com/ggmartins/iotpro/blob/master/images/slide1.png?raw=true)<br />
![Slide2](https://github.com/ggmartins/iotpro/blob/master/images/slide2.png?raw=true)<br />
![Slide3](https://github.com/ggmartins/iotpro/blob/master/images/slide3.png?raw=true)<br />

### Build & Deploy

#### Serverless Backend
- <b>npm install</b>

- <b>edit config.dev.json</b> (add password to JWS_TOKEN and SHARED_KEY, both can be base64 encoded of plain text

- <b>SLS_DEBUG=* sls deploy</b>

- <b>Offline</b><br />
enable ENABLE_LOCAL in <b>serverless.yml</b> <br />
SLS_DEBUG=* sls offline</b> (offline execution) <br />
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
