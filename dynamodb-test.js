var params = {
    //ExclusiveStartTableName: 'table_name', // optional (for pagination, returned as LastEvaluatedTableName)
    Limit: 10, // optional (to further limit the number of table names returned per page)
};
dynamodb.listTables(params, function(err, data) {
    if (err) ppJson(err); // an error occurred
    else ppJson(data); // successful response
});

var params = {
    TableName: 'iot-dev',
};
dynamodb.describeTable(params, function(err, data) {
    if (err) ppJson(err); // an error occurred
    else ppJson(data); // successful response
});

var params = {
    TableName: 'iot-dev',
    Item: { // a map of attribute name to AttributeValue
        'id': '00:00:00:00:00:01',
        'idType': 'macaddr',
        'secId': 'f0:18:98:01:02:03',
        'secType': 'macaddr',
        'createdAt': '2019-12-30 00:00:00',
        'lastSeen': '2019-12-30 00:00:00',
        'idList':['00:00:00:00:00:01', '05ac:027a', '00:00:72:6f:73:6e:65:73'],
        'idListResolv':['Apple','Apple Internal Keyboard', 'Miniware'],
        'idListTypes':['macaddr','lsusb', 'extendedpanid'],
        'bundleList': ['00:00:00:00:00:01', '05ac:027a', '00:00:72:6f:73:6e:65:73', '00:00:00:00:00:02']
        // attribute_value (string | number | boolean | null | Binary | DynamoDBSet | Array | Object)
        // more attributes...
    },
    /*ConditionExpression: 'attribute_not_exists(attribute_name)', // optional String describing the constraint to be placed on an attribute
    ExpressionAttributeNames: { // a map of substitutions for attribute names with special characters
        '#id': 'id'
    },*/
    /*ExpressionAttributeValues: { // a map of substitutions for all attribute values
        ':id': '00:00:00:00:00:00'
    },*/
    ReturnValues: 'NONE', // optional (NONE | ALL_OLD)
    ReturnConsumedCapacity: 'TOTAL', // optional (NONE | TOTAL | INDEXES)
    ReturnItemCollectionMetrics: 'SIZE', // optional (NONE | SIZE)
};
docClient.put(params, function(err, data) {
    if (err) ppJson(err); // an error occurred
    else ppJson(data); // successful response
});


var params = {
    TableName: 'iot-dev',
    Item: { // a map of attribute name to AttributeValue
        'id': '00:00:00:00:00:02',
        'idType': 'macaddr',
        'secId': 'f0:18:98:01:02:03',
        'secType': 'macaddr',
        'createdAt': '2019-12-30 00:00:00',
        'lastSeen': '2019-12-30 00:00:00',
        'idList':['00:00:00:00:00:01', '05ac:027a', '00:00:72:6f:73:6e:65:73'],
        'idListResolv':['Apple','Apple Internal Keyboard', 'Miniware'],
        'idListTypes':['macaddr','lsusb', 'extendedpanid'],
        'bundleList': ['00:00:00:00:00:01', '05ac:027a', '00:00:72:6f:73:6e:65:73', '00:00:00:00:00:01']
    },
    ReturnValues: 'NONE', // optional (NONE | ALL_OLD)
    ReturnConsumedCapacity: 'TOTAL', // optional (NONE | TOTAL | INDEXES)
    ReturnItemCollectionMetrics: 'SIZE', // optional (NONE | SIZE)
};
docClient.put(params, function(err, data) {
    if (err) ppJson(err); // an error occurred
    else ppJson(data); // successful response
});

var params = {
    TableName: 'iot-dev',
    //Limit: 0, // optional (limit the number of items to evaluate)
   // FilterExpression: 'id = :id', // a string representing a constraint on the attribute
   /* ExpressionAttributeNames: { // a map of substitutions for attribute names with special characters
        '#id': 'id'
    },/*
    ExpressionAttributeValues: { // a map of substitutions for all attribute values
        ':value': 'STRING_VALUE'
    },*/
    Select: 'ALL_ATTRIBUTES', // optional (ALL_ATTRIBUTES | ALL_PROJECTED_ATTRIBUTES | 
                              //           SPECIFIC_ATTRIBUTES | COUNT)
    //AttributesToGet: [ // optional (list of specific attribute names to return)
    //    'attribute_name',
        // ... more attributes ...
    //],
    //ConsistentRead: false, // optional (true | false)
    //Segment: 0, // optional (for parallel scan)
    //TotalSegments: 0, // optional (for parallel scan)
   /* ExclusiveStartKey: { // optional (for pagination, returned by prior calls as LastEvaluatedKey)
        attribute_name: attribute_value,
        // attribute_value (string | number | boolean | null | Binary | DynamoDBSet | Array | Object)
        // anotherKey: ...
    },*/
    ReturnConsumedCapacity: 'NONE', // optional (NONE | TOTAL | INDEXES)
};
dynamodb.scan(params, function(err, data) {
    if (err) ppJson(err); // an error occurred
    else ppJson(data); // successful response
});
