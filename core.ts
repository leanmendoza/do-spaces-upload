#!/usr/bin/env node

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
        Body: fileBuffer
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

export async function run(input: { BUCKET_NAME: string, SOURCE_PATH: string, DEST_PATH: string }) {

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

    if (!existsSync(input.SOURCE_PATH)) {
        throw new Error(`Path '${input.SOURCE_PATH}' does not exist.`)
    }

    const files: {
        localPath: string
        destPath: string
    }[] = []
    if (statSync(input.SOURCE_PATH).isDirectory()) {
        const dirFiles = readdirSync(input.SOURCE_PATH)
        for (const file of dirFiles) {
            const destPath = input.DEST_PATH.endsWith('/') ? `${input.DEST_PATH}${file}` : `${input.DEST_PATH}/${file}`
            files.push({ localPath: path.resolve(input.SOURCE_PATH, file), destPath })
        }
    } else {
        files.push({ localPath: input.SOURCE_PATH, destPath: input.DEST_PATH })
    }

    for (const file of files) {
        await uploadFile(file.localPath, file.destPath, input.BUCKET_NAME, client)
    }
}
