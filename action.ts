#!/usr/bin/env node

import core = require("@actions/core");
import { run } from "./core";

const BUCKET_NAME = core.getInput("space-bucket", { required: true, trimWhitespace: true });
const SOURCE_PATH = core.getInput("source-path", { required: true, trimWhitespace: true });
const DEST_PATH = core.getInput("dest-path", { required: true, trimWhitespace: true });

run({
    BUCKET_NAME,
    SOURCE_PATH,
    DEST_PATH
})
    .catch((e) => {
        core.setFailed(e.message);
        core.error(e);
        process.exit(1);
    })