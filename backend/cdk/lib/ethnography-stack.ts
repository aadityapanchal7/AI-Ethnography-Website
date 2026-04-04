import * as fs from 'fs';
import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import {
  HttpApi,
  CorsHttpMethod,
  HttpMethod,
} from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';

const MODERATION_MODEL_ID =
  'anthropic.claude-3-haiku-20240307-v1:0';

/** Works from cdk/lib (ts-node) or cdk/dist/lib (compiled). */
function resolveLambdasRoot(): string {
  let dir = __dirname;
  for (let i = 0; i < 12; i++) {
    const candidate = path.join(dir, 'lambdas');
    if (fs.existsSync(path.join(candidate, 'package.json'))) {
      return candidate;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(`Could not find backend/lambdas (from ${__dirname})`);
}

const lambdasRoot = resolveLambdasRoot();

export class EthnographyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const audioBucket = new s3.Bucket(this, 'AudioBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.HEAD, s3.HttpMethods.GET],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
          maxAge: 3000,
        },
      ],
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    /** Transcribe writes JSON here only (separate from uploads avoids common “can’t access / write” validation failures). */
    const transcriptBucket = new s3.Bucket(this, 'TranscriptOutputBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const submissionsTable = new dynamodb.Table(this, 'Submissions', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const postsTable = new dynamodb.Table(this, 'Posts', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const commentsTable = new dynamodb.Table(this, 'Comments', {
      partitionKey: { name: 'postId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'commentKey', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const postVotesTable = new dynamodb.Table(this, 'PostVotes', {
      partitionKey: { name: 'voteKey', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      timeToLiveAttribute: 'ttl',
    });

    const transcribeDataAccessRole = new iam.Role(this, 'TranscribeDataAccess', {
      assumedBy: new iam.ServicePrincipal('transcribe.amazonaws.com'),
      description: 'Transcribe: read audio bucket, write transcript bucket',
    });
    audioBucket.grantRead(transcribeDataAccessRole);
    transcriptBucket.grantReadWrite(transcribeDataAccessRole);
    transcribeDataAccessRole.addToPolicy(
      new iam.PolicyStatement({
        sid: 'TranscribeGetBucketLocation',
        actions: ['s3:GetBucketLocation'],
        resources: [audioBucket.bucketArn, transcriptBucket.bucketArn],
      }),
    );
    transcribeDataAccessRole.addToPolicy(
      new iam.PolicyStatement({
        sid: 'TranscribeTranscriptAclAndMultipart',
        actions: ['s3:PutObjectAcl', 's3:AbortMultipartUpload', 's3:ListMultipartUploadParts'],
        resources: [transcriptBucket.arnForObjects('*')],
      }),
    );

    /** Resource policies: Transcribe’s access check often requires the data-access role on the bucket policy, not only on the role. */
    const transcribePrincipal = new iam.ArnPrincipal(transcribeDataAccessRole.roleArn);
    audioBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        sid: 'TranscribeReadUploads',
        principals: [transcribePrincipal],
        actions: ['s3:GetObject'],
        resources: [audioBucket.arnForObjects('*')],
      }),
    );
    audioBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        sid: 'TranscribeListAudioBucket',
        principals: [transcribePrincipal],
        actions: ['s3:ListBucket', 's3:GetBucketLocation'],
        resources: [audioBucket.bucketArn],
      }),
    );
    transcriptBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        sid: 'TranscribeWriteTranscripts',
        principals: [transcribePrincipal],
        actions: [
          's3:PutObject',
          's3:GetObject',
          's3:PutObjectAcl',
          's3:AbortMultipartUpload',
          's3:ListMultipartUploadParts',
        ],
        resources: [transcriptBucket.arnForObjects('*')],
      }),
    );
    transcriptBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        sid: 'TranscribeListTranscriptBucket',
        principals: [transcribePrincipal],
        actions: ['s3:ListBucket', 's3:GetBucketLocation'],
        resources: [transcriptBucket.bucketArn],
      }),
    );

    /** Transcribe’s S3 pre-check sometimes evaluates as the service; mirror AWS doc patterns alongside role-based access. */
    const transcribeSourceCondition = {
      StringEquals: { 'aws:SourceAccount': this.account },
      ArnLike: { 'aws:SourceArn': `arn:aws:transcribe:${this.region}:${this.account}:*` },
    };
    const transcribeService = new iam.ServicePrincipal('transcribe.amazonaws.com');
    audioBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        sid: 'TranscribeServiceReadAudio',
        principals: [transcribeService],
        actions: ['s3:GetObject'],
        resources: [audioBucket.arnForObjects('*')],
        conditions: transcribeSourceCondition,
      }),
    );
    audioBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        sid: 'TranscribeServiceListAudioBucket',
        principals: [transcribeService],
        actions: ['s3:ListBucket', 's3:GetBucketLocation'],
        resources: [audioBucket.bucketArn],
        conditions: transcribeSourceCondition,
      }),
    );
    transcriptBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        sid: 'TranscribeServiceWriteTranscripts',
        principals: [transcribeService],
        actions: [
          's3:PutObject',
          's3:GetObject',
          's3:PutObjectAcl',
          's3:AbortMultipartUpload',
          's3:ListMultipartUploadParts',
        ],
        resources: [transcriptBucket.arnForObjects('*')],
        conditions: transcribeSourceCondition,
      }),
    );
    transcriptBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        sid: 'TranscribeServiceListTranscriptBucket',
        principals: [transcribeService],
        actions: ['s3:ListBucket', 's3:GetBucketLocation'],
        resources: [transcriptBucket.bucketArn],
        conditions: transcribeSourceCondition,
      }),
    );

    const lambdaEnv = (extra: Record<string, string> = {}) => ({
      AUDIO_BUCKET: audioBucket.bucketName,
      TRANSCRIPT_OUTPUT_BUCKET: transcriptBucket.bucketName,
      SUBMISSIONS_TABLE: submissionsTable.tableName,
      POSTS_TABLE: postsTable.tableName,
      COMMENTS_TABLE: commentsTable.tableName,
      VOTES_TABLE: postVotesTable.tableName,
      TRANSCRIBE_DATA_ACCESS_ROLE_ARN: transcribeDataAccessRole.roleArn,
      MODERATION_MODEL_ID,
      ...extra,
    });

    const bundling = {
      projectRoot: lambdasRoot,
      depsLockFilePath: path.join(lambdasRoot, 'package-lock.json'),
    };

    const presignFn = new NodejsFunction(this, 'PresignUploadFn', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(lambdasRoot, 'handlers/presign-upload.ts'),
      handler: 'handler',
      environment: lambdaEnv(),
      timeout: cdk.Duration.seconds(12),
      memorySize: 256,
      ...bundling,
    });
    audioBucket.grantPut(presignFn);

    const completeFn = new NodejsFunction(this, 'CompleteSubmissionFn', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(lambdasRoot, 'handlers/complete-submission.ts'),
      handler: 'handler',
      environment: {
        ...lambdaEnv(),
        /** Fallback if `metadata.language` is missing or not in `lambdas/lib/transcribe-job.ts` map */
        TRANSCRIBE_LANGUAGE_CODE: 'en-US',
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      ...bundling,
    });
    audioBucket.grantRead(completeFn);
    submissionsTable.grantWriteData(completeFn);
    completeFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['transcribe:StartTranscriptionJob'],
        resources: ['*'],
      })
    );
    completeFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['iam:PassRole'],
        resources: [transcribeDataAccessRole.roleArn],
        conditions: {
          StringEquals: {
            'iam:PassedToService': 'transcribe.amazonaws.com',
          },
        },
      })
    );

    const listPostsFn = new NodejsFunction(this, 'ListPostsFn', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(lambdasRoot, 'handlers/list-posts.ts'),
      handler: 'handler',
      environment: lambdaEnv(),
      timeout: cdk.Duration.seconds(15),
      memorySize: 256,
      ...bundling,
    });
    postsTable.grantReadData(listPostsFn);

    const getPostFn = new NodejsFunction(this, 'GetPostFn', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(lambdasRoot, 'handlers/get-post.ts'),
      handler: 'handler',
      environment: lambdaEnv(),
      timeout: cdk.Duration.seconds(15),
      memorySize: 256,
      ...bundling,
    });
    postsTable.grantReadData(getPostFn);
    commentsTable.grantReadData(getPostFn);

    const addCommentFn = new NodejsFunction(this, 'AddCommentFn', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(lambdasRoot, 'handlers/add-comment.ts'),
      handler: 'handler',
      environment: lambdaEnv(),
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
      ...bundling,
    });
    postsTable.grantReadData(addCommentFn);
    commentsTable.grantWriteData(addCommentFn);

    const upvotePostFn = new NodejsFunction(this, 'UpvotePostFn', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(lambdasRoot, 'handlers/upvote-post.ts'),
      handler: 'handler',
      environment: lambdaEnv(),
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
      ...bundling,
    });
    postsTable.grantReadWriteData(upvotePostFn);
    postVotesTable.grantReadWriteData(upvotePostFn);

    const processTranscribeFn = new NodejsFunction(this, 'ProcessTranscribeFn', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(lambdasRoot, 'handlers/process-transcribe-job.ts'),
      handler: 'handler',
      environment: lambdaEnv({
        SKIP_MODERATION: 'true',
      }),
      timeout: cdk.Duration.seconds(120),
      memorySize: 512,
      ...bundling,
    });
    submissionsTable.grantReadWriteData(processTranscribeFn);
    postsTable.grantWriteData(processTranscribeFn);
    audioBucket.grantRead(processTranscribeFn);
    transcriptBucket.grantRead(processTranscribeFn);
    processTranscribeFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['transcribe:GetTranscriptionJob'],
        resources: ['*'],
      })
    );
    processTranscribeFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['bedrock:InvokeModel'],
        resources: [
          `arn:aws:bedrock:${this.region}::foundation-model/${MODERATION_MODEL_ID}`,
        ],
      })
    );

    new events.Rule(this, 'TranscribeJobStateRule', {
      description: 'Fan out Transcribe job COMPLETED / FAILED to processor',
      eventPattern: {
        source: ['aws.transcribe'],
        detailType: ['Transcribe Job State Change'],
        detail: {
          TranscriptionJobStatus: ['COMPLETED', 'FAILED'],
        },
      },
      targets: [new targets.LambdaFunction(processTranscribeFn)],
    });

    const httpApi = new HttpApi(this, 'HttpApi', {
      apiName: 'ethnography-api',
      corsPreflight: {
        allowHeaders: ['Content-Type', 'X-Voter-Id'],
        allowMethods: [
          CorsHttpMethod.GET,
          CorsHttpMethod.POST,
          CorsHttpMethod.OPTIONS,
        ],
        allowOrigins: ['*'],
        maxAge: cdk.Duration.days(1),
      },
      createDefaultStage: true,
    });

    httpApi.addRoutes({
      path: '/uploads/presign',
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration('PresignIntegration', presignFn),
    });
    httpApi.addRoutes({
      path: '/submissions/complete',
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration('CompleteIntegration', completeFn),
    });
    httpApi.addRoutes({
      path: '/posts',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration('ListPostsIntegration', listPostsFn),
    });
    httpApi.addRoutes({
      path: '/posts/{id}',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration('GetPostIntegration', getPostFn),
    });
    httpApi.addRoutes({
      path: '/posts/{id}/comments',
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration('AddCommentIntegration', addCommentFn),
    });
    httpApi.addRoutes({
      path: '/posts/{id}/upvote',
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration('UpvotePostIntegration', upvotePostFn),
    });

    new cdk.CfnOutput(this, 'HttpApiUrl', {
      value: httpApi.url ?? '',
      description: 'Set NEXT_PUBLIC_API_BASE_URL to this value (no trailing slash)',
    });
    new cdk.CfnOutput(this, 'AudioBucketName', {
      value: audioBucket.bucketName,
    });
    new cdk.CfnOutput(this, 'TranscriptBucketName', {
      value: transcriptBucket.bucketName,
      description: 'Transcribe JSON output (processor reads from here)',
    });
    new cdk.CfnOutput(this, 'ModerationModelId', {
      value: MODERATION_MODEL_ID,
      description: 'Ensure this model is enabled in Bedrock model access for your account/region',
    });
  }
}
