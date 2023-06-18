/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-syntax */
/* eslint-disable prefer-const */
/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import * as mime from 'mime';
import * as fs from 'fs';

const APP_NAME = 'my-todos-skand';

function uploadToS3(
  buildDir: string,
  bucket: aws.s3.Bucket,
  publicAccessBlock: aws.s3.BucketPublicAccessBlock,
  subDir = ''
) {
  for (let item of require('fs').readdirSync(`${buildDir}${subDir}`)) {
    const filePath = require('path').join(buildDir, subDir, item);
    if (fs.statSync(filePath).isDirectory()) {
      uploadToS3(`${buildDir}`, bucket, publicAccessBlock, `${subDir}/${item}`);
    } else {
      const object = new aws.s3.BucketObject(
        subDir.length > 0 ? `${subDir.slice(1)}/${item}` : item,
        {
          bucket,
          source: new pulumi.asset.FileAsset(filePath),
          contentType: mime.getType(filePath) || undefined,
          acl: 'public-read'
        },
        { dependsOn: publicAccessBlock }
      );
    }
  }
}

function getAppConfig(app: string) {
  const stackConfig = new pulumi.Config(app);
  return {
    stack: pulumi.getStack(),
    targetDomain: stackConfig.require('targetDomain')
  };
}

function configureBucketAccessControls(bucket: aws.s3.Bucket) {
  const ownershipControls = new aws.s3.BucketOwnershipControls('ownership-controls', {
    bucket: bucket.id,
    rule: {
      objectOwnership: 'ObjectWriter'
    }
  });

  const publicAccessBlock = new aws.s3.BucketPublicAccessBlock('public-access-block', {
    bucket: bucket.id,
    blockPublicAcls: false
  });

  return {
    ownershipControls,
    publicAccessBlock
  };
}

function main() {
  const { stack, targetDomain } = getAppConfig(APP_NAME);

  const bucket = new aws.s3.Bucket(APP_NAME, {
    bucket: targetDomain,
    website: {
      indexDocument: 'index.html'
    }
  });

  const buildDirectory = `${process.cwd()}\\..\\dist`;
  const { publicAccessBlock } = configureBucketAccessControls(bucket);

  uploadToS3(buildDirectory, bucket, publicAccessBlock);

  return {
    [stack]: {
      bucketName: bucket.id,
      websiteUrl: pulumi.interpolate`http://${bucket.websiteEndpoint}`
    }
  };
}

export default main();
