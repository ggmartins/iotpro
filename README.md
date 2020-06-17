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

#### iotmon Golang Client (TESTED ON MAC ONLY, golang and homebrew required)

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

#### 1. The application allows users to create, update, delete items - A user of the web application can use the interface to create, delete and complete an item.<br />
<br />


```
./iotmon (first execution in automatically create device, create status and auto register the device (jwt token in iotmon.status file)

2020/06/16 21:52:08 Initializing...
2020/06/16 21:52:08 INFO: NEW EXECUTION, renaming old ./iotmon.status.yaml to ./iotmon.status.backup.
2020/06/16 21:52:08 Done.
2020/06/16 21:52:08 Using key: [dGh****g==]
05ac:027a - Apple Inc. Apple Internal Keyboard / Trackpad
05ac:8103 - Apple Inc. Headset
05ac:8262 - Apple Inc. Ambient Light Sensor
05ac:8514 - Apple Inc. FaceTime HD Camera (Built-in)
05ac:8233 - Apple Inc. Apple T2 Controller
05ac:027a - Apple Inc. Apple T2 Bus
2020/06/16 21:52:09 Done.
default route iface:f0:18:98:85:d5:1f
routeIp: 10.0.0.1
2020/06/16 21:52:09 Finished.
30356163-3a30-4237-a130-3561633a3032
30356163-3a38-4130-b330-3561633a3831
30356163-3a38-4236-b230-3561633a3832
30356163-3a38-4531-b430-3561633a3835
30356163-3a38-4233-b330-3561633a3832
Creating Device:66303a31-383a-4938-ba38-353a64353a31
New password:asdf
Repeat new password:asdf
2020/06/16 21:52:13 POST Device Create "201 Created"
2020/06/16 21:52:13 Token: "200 OK" {"message":"eyJ..."
2020/06/16 21:52:13 POST Status Created. "201 Created"
2020/06/16 21:52:14 GET Status "200 OK"
{"message":"{"Items":[{"bundleListType":["usb","usb","usb","usb","usb"],"bundleListDesc":["Apple Inc. Apple T2 Bus","Apple Inc. Headset","Apple Inc. Ambient Light Sensor","Apple Inc. FaceTime HD Camera (Built-in)","Apple Inc. Apple T2 Controller"],----->"lastSeen":"2020-06-16T21:52:09-05:00"<-----,"bundleList":["05ac:027a","05ac:8103","05ac:8262","05ac:8514","05ac:8233"],"bundleListUUID":["30356163-3a30-4237-a130-3561633a3032","30356163-3a38-4130-b330-3561633a3831","30356163-3a38-4236-b230-3561633a3832","30356163-3a38-4531-b430-3561633a3835","30356163-3a38-4233-b330-3561633a3832"],"uuid":"66303a31-383a-4938-ba38-353a64353a31","createdAt":"2020-06-16T21:52:09-05:00","idType":"mac","id":"f0:18:98:85:d5:1f"}],"Count":1,"ScannedCount":1}"}


./iotmon (following executions should update status, full list od bundled devices + lastSeen)

2020/06/16 22:14:45 Initializing...
2020/06/16 22:14:45 Done.
2020/06/16 22:14:45 Using key: [dGh****g==]
05ac:027a - Apple Inc. Apple Internal Keyboard / Trackpad
05ac:8103 - Apple Inc. Headset
05ac:8262 - Apple Inc. Ambient Light Sensor
05ac:8514 - Apple Inc. FaceTime HD Camera (Built-in)
05ac:8233 - Apple Inc. Apple T2 Controller
05ac:027a - Apple Inc. Apple T2 Bus
2020/06/16 22:14:46 Done.
default route iface:f0:18:98:85:d5:1f
routeIp: 10.0.0.1
2020/06/16 22:14:47 Finished.
30356163-3a38-4236-b230-3561633a3832
30356163-3a38-4531-b430-3561633a3835
30356163-3a38-4233-b330-3561633a3832
30356163-3a30-4237-a130-3561633a3032
30356163-3a38-4130-b330-3561633a3831
2020/06/16 22:14:47 INFO: using [./iotmon.status.yaml] with timestamp: 2020-06-16T21:52:09-05:00 as cached.
2020/06/16 22:14:49 PUT Status "200 OK"
2020/06/16 22:14:50 GET Status "200 OK"
{"message":"{"Items":[{"bundleListDesc":["Apple Inc. Ambient Light Sensor","Apple Inc. FaceTime HD Camera (Built-in)","Apple Inc. Apple T2 Controller","Apple Inc. Apple T2 Bus","Apple Inc. Headset"],"bundleListType":["usb","usb","usb","usb","usb"],--->"lastSeen":"2020-06-16T22:14:47-05:00"<----,"bundleList":["05ac:8262","05ac:8514","05ac:8233","05ac:027a","05ac:8103"],"bundleListUUID":["30356163-3a38-4236-b230-3561633a3832","30356163-3a38-4531-b430-3561633a3835","30356163-3a38-4233-b330-3561633a3832","30356163-3a30-4237-a130-3561633a3032","30356163-3a38-4130-b330-3561633a3831"],"uuid":"66303a31-383a-4938-ba38-353a64353a31","createdAt":"2020-06-16T21:52:09-05:00","idType":"mac","id":"f0:18:98:85:d5:1f"}],"Count":1,"ScannedCount":1}"}


(to delete set "status: disable" in iotmon.config.json and re-run iotmon)
30356163-3a38-4233-b330-3561633a3832
30356163-3a30-4237-a130-3561633a3032
2020/06/16 22:35:38 INFO: using [./iotmon.status.yaml] with timestamp: 2020-06-16T21:52:09-05:00 as cached.
2020/06/16 22:35:40 DEL Delete "200 OK" {"message":"OK"}

```

#### 2. The application allows users to upload a file. - A user of the web interface can click on a "pencil" button, then select and upload a file. A file should appear in the list of items on the home page.<br />
<br />

```
mkdir -p /tmp/uploaded
./cp somefile upload/
./iotmon (upload is done through manually moving files to ./upload/ folder)
2020/06/16 22:24:15 Initializing...
2020/06/16 22:24:15 Done.
2020/06/16 22:24:15 Using key: [dGh****g==]
05ac:027a - Apple Inc. Apple Internal Keyboard / Trackpad
05ac:8103 - Apple Inc. Headset
05ac:8262 - Apple Inc. Ambient Light Sensor
05ac:8514 - Apple Inc. FaceTime HD Camera (Built-in)
05ac:8233 - Apple Inc. Apple T2 Controller
05ac:027a - Apple Inc. Apple T2 Bus
2020/06/16 22:24:16 Done.
default route iface:f0:18:98:85:d5:1f
routeIp: 10.0.0.1
2020/06/16 22:24:16 Finished.
30356163-3a38-4130-b330-3561633a3831
30356163-3a38-4236-b230-3561633a3832
30356163-3a38-4531-b430-3561633a3835
30356163-3a38-4233-b330-3561633a3832
30356163-3a30-4237-a130-3561633a3032
2020/06/16 22:24:16 INFO: using [./iotmon.status.yaml] with timestamp: 2020-06-16T21:52:09-05:00 as cached.
2020/06/16 22:24:17 PUT Status "200 OK"
2020/06/16 22:24:18 GET Upload of upload/iotmon /dev/iot/upload/66303a31-383a-4938-ba38-353a64353a31/attachment ("200 OK")
2020/06/16 22:24:18 URL Signed: "https://serverless-iotpcap-dev.s3.amazonaws.com/66303a31-383a-4938-ba38-353a64353a31?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAZ72W6GNYUSRGHJHC%2F20200617%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20200617T032418Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFQaCXVzLWVhc3QtMSJIMEYCIQD61Nyih%2BJ2pE8KHRyJaaNrr6d8F%2BfHmtW0kHFYIJXFUAIhAPTXmJoOte2ZuJ9pjzmtDwTNX0oXmPsz6AXstEezspYgKuQBCM3%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQABoMNjg2ODQwMjMwNzY5Igwh2kM%2BWRM2wJRrboMquAE1sCTrydZ%2BEeUU6TTJjBQBcV%2FvfavfX%2BTAdhVDsrf%2Bu3Dk5Ns07R%2FEWWhxMD5XlMaeMa07TmYzf9NKqJDAx3kTFaK0rpZObi3la%2Fz7%2BrQrdpa%2FvM7%2Bog4qazfPecqolCzidu%2FyMeTNmb9uLN8hsxazuuO9hOX%2BDHMvwDVjuRuBH4783FA8Ys8mDsWlclj70plxcUKGW6WFIyP0tdTgzmG3L%2FJzeN7QgwUVqz4ZTfTuR1Lx19B9BAJSMOGZpvcFOt8BU88dbLm0k9fABsU15ehvB2EghCi5LPadZpP6WhBOaA7Q5UX85F6nhxnr31Fz3oDJKWiR8gObCcFoDsBt9hsiBPaLDgE7M5hf5B8FXaAvPL4PJY0aCkPDFkpEPlM8xgqf5Wus6aSM78HnTbEzPLwCBteHJPllAtEeCx3IIYLkt4XXuZXfur2pSI2AuQdP59d3Ngk31mr%2F84t%2B8HtdORkgc7tUigSlsWyjLiW9Vp6nt%2Fb%2B71Snt9BIWV7EngASxrYnrMEiYJYyLQTA2FEHjXFxVUaM87vkv6smcPykar10Eg%3D%3D&X-Amz-Signature=2bec9d5c8bffca44bccf57d969075daf75576438ef9661b6f473701d7bf074f8&X-Amz-SignedHeaders=host"
2020/06/16 22:24:27 URL Signed OK.

./iotmon (please node the new state with file)
2020/06/16 22:26:21 Initializing...
2020/06/16 22:26:21 Done.
2020/06/16 22:26:21 Using key: [dGh****g==]
05ac:027a - Apple Inc. Apple Internal Keyboard / Trackpad
05ac:8103 - Apple Inc. Headset
05ac:8262 - Apple Inc. Ambient Light Sensor
05ac:8514 - Apple Inc. FaceTime HD Camera (Built-in)
05ac:8233 - Apple Inc. Apple T2 Controller
05ac:027a - Apple Inc. Apple T2 Bus
2020/06/16 22:26:22 Done.
default route iface:f0:18:98:85:d5:1f
routeIp: 10.0.0.1
2020/06/16 22:26:22 Finished.
30356163-3a38-4236-b230-3561633a3832
30356163-3a38-4531-b430-3561633a3835
30356163-3a38-4233-b330-3561633a3832
30356163-3a30-4237-a130-3561633a3032
30356163-3a38-4130-b330-3561633a3831
2020/06/16 22:26:22 INFO: using [./iotmon.status.yaml] with timestamp: 2020-06-16T21:52:09-05:00 as cached.
2020/06/16 22:26:22 PUT Status "200 OK"
2020/06/16 22:26:23 GET Status "200 OK"
{"message":"{"Items":[{"bundleListDesc":["Apple Inc. Ambient Light Sensor","Apple Inc. FaceTime HD Camera (Built-in)","Apple Inc. Apple T2 Controller","Apple Inc. Apple T2 Bus","Apple Inc. Headset"],"bundleListType":["usb","usb","usb","usb","usb"],"lastSeen":"2020-06-16T22:26:22-05:00",------->"attachmentUrl":"https://serverless-iotpcap-dev.s3.amazonaws.com/66303a31-383a-4938-ba38-353a64353a31"<------,"bundleList":["05ac:8262","05ac:8514","05ac:8233","05ac:027a","05ac:8103"],"bundleListUUID":["30356163-3a38-4236-b230-3561633a3832","30356163-3a38-4531-b430-3561633a3835","30356163-3a38-4233-b330-3561633a3832","30356163-3a30-4237-a130-3561633a3032","30356163-3a38-4130-b330-3561633a3831"],"uuid":"66303a31-383a-4938-ba38-353a64353a31","createdAt":"2020-06-16T21:52:09-05:00","idType":"mac","id":"f0:18:98:85:d5:1f"}],"Count":1,"ScannedCount":1}"}
```

#### 3. The application only displays items for a logged in user. If you log out from a current user and log in as a different user, the application should not show items created by the first account. <br />
<br />
if we run iotmon on another machine a new uuid is generated, therefore restricting operation to that particular device.
<br />
#### 4. Authentication is implemented and does not allow unauthenticated access. A user needs to authenticate in order to use an application. <br />
<br />
Multi layer auth is implemented using encoded shared key config.dev.json:SHARED_KEY and salted brcrypt for device registration.<br />
<br />
#### 4. The code is split into multiple layers separating business logic from I/O related code. Code of Lambda functions is split into multiple files/classes. The business logic of an application is separated from code for database access, file storage, and code related to AWS Lambda. <br />
<br />
- IoTAccess.ts encapsulates AWS operations and the logic is kept in the handlers due to their simplicity<br />
<br />
#### 4. All resources in the application are defined in the "serverless.yml" file - All resources needed by an application are defined in the "serverless.yml". A developer does not need to create them manually using AWS console.<br />
<br />
serverless-offline was extensevely used throughout the development phase.<br />
<br />
#### 5. Each function has its own set of permissions. Instead of defining all permissions under provider/iamRoleStatements, permissions are defined per function in the functions section of the "serverless.yml". <br />
<br />
done. <br />
<br />
#### 6. Application has sufficient monitoring. Application has at least some of the following: Distributed tracing is enabled It has a sufficient amount of log statements It generates application level metrics<br />
<br />
Used winson logger + manual logging configurations for API Gateway<br />
<br />
#### 7. Data is stored in a table with a composite key. 1:M (1 to many) relationship between users and items is modeled using a DynamoDB table that has a composite key with both partition and sort keys. Should be defined similar to this<br />
<br />
At least one table has composite key (IoT Status).<br />
<br />

#### 8.  Scan operation is not used to read data from a database. Items are fetched using the "query()" method and not "scan()" method (which is less efficient on large datasets)<br />
<br />
No scan in the code.

