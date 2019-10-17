const replace = require("replace-in-file");

export function replaceValues(path: string, rtk: string, server: string, user: string, password: string, port: string, useSSL: string, database: string, targetBucket: string, collections: string) {
    replace.sync({
        files: path,
        from: [/RTK_REPLACE/g, /SERVER_REPLACE/g, /USER_REPLACE/g, /PASSWORD_REPLACE/g, /PORT_REPLACE/g, /USE_SSL_REPLACE/g, /DATABASE_REPLACE/g, /TARGET_BUCKET/g, /COLLECTIONS_REPLACE/g],
        to: [rtk, server, user, password, port, useSSL, database, targetBucket, collections]
    });
}