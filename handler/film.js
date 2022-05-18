"use strict";
const { sendResponse } = require('../function/index');
const dynamoDB = require('../config/dynamoDB');

module.exports.getMany = async event => {
    try {
        const params = {
            TableName: process.env.DYNAMO_TABLE_NAME,
            AttributesToGet: [
                'id','title', 'avg_vote', 'year', 'genre'
            ],
            Limit: 1000,
        };

        const data = await dynamoDB.scan(params).promise();
        if(data.Count > 0) {
            return sendResponse(200, {
                item: data.Items
            });
        } else {
            return sendResponse(404, {});
        }
    } catch (err) {
        return sendResponse(500, { message: "Error: "+err.message });
    }
}

module.exports.get = async event => {
    try {
        const { id } = event.pathParameters || event;
        console.log(id);
        console.log(event);
        if(id === undefined){
            return sendResponse(404, {});
        }

        const params = {
            TableName: process.env.DYNAMO_TABLE_NAME,
            KeyConditionExpression: "id = :id",
            ExpressionAttributeValues: {
                ":id": id
            },
            Select: "ALL_ATTRIBUTES",
        };

        const data = await dynamoDB.query(params).promise();
        if(data.Count > 0) {
            return sendResponse(200, {
                item: data.Items
            });
        } else {
            return sendResponse(404, {});
        }
    } catch (err) {
        return sendResponse(500, { message: "Error: "+err.message });
    }
}