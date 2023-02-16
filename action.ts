#!/usr/bin/env node

import core = require("@actions/core");
import AWS from 'aws-sdk';
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import path from 'path';

async function uploadFile(sourcefilePath: string, destFilePath: string, bucketName: string, client: AWS.S3) {

    // Reads the file into a Buffer
    const fileBuffer = readFileSync(sourcefilePath);

    // Set the params for the upload
    const params: AWS.S3.PutObjectRequest = {
        Bucket: bucketName,
        Key: destFilePath,
        Body: fileBuffer,
        ACL: "public-read"
    };

    // Uploads the file to the bucket
    await new Promise<void>((resolve, reject) => {
        client.upload(params, function (err: any, data: any) {
            if (err) {
                console.log(err);
                reject(err)
            } else {
                console.log(`Successfully uploaded ${sourcefilePath} to ${destFilePath}`);
                resolve()
            }
        });
    })
}

async function run() {

    // Replaces with your Spaces access key and secret key
    const ACCESS_KEY = process.env["SPACE_ACCESS_KEY"]
    const SECRET_KEY = process.env["SPACE_SECRET_KEY"]

    // Set the region and endpoint for your Space
    const REGION = process.env["SPACE_REGION"]
    const ENDPOINT = process.env["SPACE_ENDPOINT"];

    const spaceVariables = { REGION, ENDPOINT, ACCESS_KEY, SECRET_KEY }
    if (Object.values(spaceVariables).some(value => value === undefined)) {
        throw new Error(`SPACES variables must be defined. ${spaceVariables}`)
    }

    // Creates a client for the Spaces service
    const client = new AWS.S3({
        accessKeyId: ACCESS_KEY,
        secretAccessKey: SECRET_KEY,
        region: REGION,
        endpoint: ENDPOINT
    });

    // Set the name of your bucket and the file you want to upload
    const BUCKET_NAME = core.getInput("space-bucket", { required: true, trimWhitespace: true });
    const SOURCE_PATH = core.getInput("source-path", { required: true, trimWhitespace: true });
    const DEST_PATH = core.getInput("dest-path", { required: true, trimWhitespace: true });


    if (!existsSync(SOURCE_PATH)) {
        throw new Error(`Path '${SOURCE_PATH}' does not exist.`)
    }

    const files: {
        localPath: string
        destPath: string
    }[] = []
    if (statSync(SOURCE_PATH).isDirectory()) {
        const dirFiles = readdirSync(SOURCE_PATH)
        for (const file of dirFiles) {
            files.push({ localPath: path.resolve(SOURCE_PATH, file), destPath: path.resolve(DEST_PATH, file) })
        }
    } else {
        files.push({ localPath: SOURCE_PATH, destPath: DEST_PATH })
    }

    for (const file of files) {
        await uploadFile(file.localPath, file.destPath, BUCKET_NAME, client)
    }
}

run()
    .catch((e) => {
        core.setFailed(e.message);
        core.error(e);
        process.exit(1);
    })