import 'source-map-support/register';
import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import { createLogger } from '../../utils/logger';
const XAWS = AWSXRay.captureAWS(AWS);
const s3 = new XAWS.S3({
    signatureVersion: 'v4'
});
const bucketName = process.env.IMAGES_S3_BUCKET;
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;
const logger = createLogger('url');
export const handler = async (event) => {
    const todoId = event.pathParameters.todoId;
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const url = generateUploadUrl(todoId);
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': '*'
        },
        body: JSON.stringify({
            uploadUrl: url
        })
    };
};
function generateUploadUrl(todoId) {
    logger.info(`Generating URL for todo id ${todoId}`);
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: todoId,
        Expires: urlExpiration
    });
}
//# sourceMappingURL=generateUploadUrl.js.map