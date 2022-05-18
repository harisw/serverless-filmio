"use strict";

const AWS = require('aws-sdk');
const S3 = new AWS.S3();
const docClient = new AWS.DynamoDB.DocumentClient({region: process.env.region});
const csv = require('csvtojson');
const crypto = require('crypto');

AWS.config.update({
    maxRetries: 5,
retryDelayOptions: {base: 500}
});
const addData = params => {
    docClient.put(params, (err, data) => {
        if(err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Added item");
        }
    })
};

module.exports.importFilm =  async (ev, context) => {
    // try {
        const body = JSON.parse(ev.body);
        const { key } = body;
        // const data = await S3.getObject({
        //     Bucket: process.env.FILMIO_BUCKET,
        //     Key: key
        // }).promise();
        
        const params = {
            Bucket: process.env.FILMIO_BUCKET,
            Key: `data/${key}`
        };
        console.log(params)
        const s3Stream = S3.getObject(params).createReadStream();
        csv().fromStream(s3Stream)
            .on('data', row => {
                let content = JSON.parse(row);
                let toPush = {
                    TableName: process.env.DYNAMO_TABLE_NAME,
                    Item: {
                        id: crypto.randomBytes(8).toString("hex"),
                        title: content.title,
                        year: Number(content.year) || 0,
                        genre: content.genre,
                        duration: content.duration,
                        country: content.country,
                        directors: content.directors,
                        actors: content.actors,
                        avg_vote: Number(content.avg_vote) || 0,
                        total_votes: Number(content.total_votes) || 0,
                        description: content.description
                    }
                };
                //console.log(toPush)
                addData(toPush);
            })
    // } catch (err) {
    //     return {
    //         statusCode: err.statusCode || 400,
    //         body: err.message || JSON.stringify(err.message)
    //     }
    // }
};