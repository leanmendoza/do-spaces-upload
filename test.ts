import { run } from "./core";

const testSuite = {
    SPACE_ACCESS_KEY: '',
    SPACE_SECRET_KEY: '',
    SPACE_REGION: '',
    SPACE_ENDPOINT: '.digitaloceanspaces.com',
    BUCKET_NAME: '',
    SOURCE_PATH: 'test_files',
    DEST_PATH: ''
}

async function test() {
    const params = testSuite

    process.env["SPACE_ACCESS_KEY"] = params.SPACE_ACCESS_KEY
    process.env["SPACE_SECRET_KEY"] = params.SPACE_SECRET_KEY
    process.env["SPACE_REGION"] = params.SPACE_REGION
    process.env["SPACE_ENDPOINT"] = params.SPACE_ENDPOINT

    await run({
        BUCKET_NAME: params.BUCKET_NAME,
        SOURCE_PATH: params.SOURCE_PATH,
        DEST_PATH: params.DEST_PATH
    })
}

test()