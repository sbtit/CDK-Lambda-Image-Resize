import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-lambda-event-sources';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class CdkLambdaImageResizeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3バケットの作成
    const bucket = new s3.Bucket(this, 'ImageBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY, // スタック削除時にバケットも削除する
    });

    // Lambda関数の作成
    const imageResizeFunction = new lambda.Function(this, 'ImageResizeFunction', {
      runtime: lambda.Runtime.NODEJS_LATEST,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'), // Lambda関数のコードがあるディレクトリ
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
    });

    // Lambda関数にIAMポリシーを追加してS3にアクセス権を与える
    bucket.grantReadWrite(imageResizeFunction);

    // Lambda関数をトリガーするS3イベントの作成
    imageResizeFunction.addEventSource(new events.S3EventSource(bucket, {
      events: [s3.EventType.OBJECT_CREATED],
    }));
  }
}

// CDKアプリケーションの作成
const app = new cdk.App();

// スタックの作成
new CdkLambdaImageResizeStack(app, 'ImageResizeStack');
