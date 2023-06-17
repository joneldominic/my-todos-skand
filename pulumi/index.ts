/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';

// Create an AWS resource (S3 Bucket)
const bucket = new aws.s3.Bucket('my-bucket');

// Export the name of the bucket
// eslint-disable-next-line import/prefer-default-export
export const bucketName = bucket.id;
