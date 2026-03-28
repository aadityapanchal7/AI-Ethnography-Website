# Backend — AWS (CDK)

This stack implements the pipeline you described:

1. **Browser** gets a presigned **S3** upload URL → uploads audio (WebM/MP4/MP3/WAV).
2. **Complete submission** writes a row in **DynamoDB** and starts **Amazon Transcribe** (job name = submission UUID).
3. **EventBridge** invokes a Lambda when the job **COMPLETED** or **FAILED**.
4. On success, Lambda loads the transcript JSON, runs **Bedrock (Claude)** to **approve/reject** against community guidelines and to produce **title, summary, tags**; approved items become a **post**; rejected submissions are marked `MODERATION_REJECTED`.
5. **HTTP API** exposes `GET /posts`, `GET /posts/{id}`, `POST /posts/{id}/comments` for **anonymous** comments.

The Next.js app talks to the API when `NEXT_PUBLIC_API_BASE_URL` is set (see repo root `.env.example`).

## S3, DynamoDB, and the rest — you do **not** create them by hand

A single **`npm run deploy`** (CDK) provisions everything the app needs in your account/region. You **do not** need to open the S3 or DynamoDB consoles first to “create a bucket” or “create tables” unless you are intentionally doing a custom setup.

| Resource | What CDK creates | Purpose |
|----------|------------------|---------|
| **S3 audio bucket** | Private, SSE-S3, CORS for browser `PUT` | Presigned uploads; Transcribe **reads** input media here |
| **S3 transcript bucket** | Private, SSE-S3, no CORS | Transcribe **writes** JSON transcripts here (separate bucket avoids common access errors) |
| **DynamoDB `Submissions`** | Partition key `id` (string), on-demand | Submission rows, Transcribe job name, moderation outcome |
| **DynamoDB `Posts`** | Partition key `id` (string), on-demand | Published discussion posts (title, summary, transcript snippet, etc.) |
| **DynamoDB `Comments`** | PK `postId`, SK `commentKey`, on-demand | Anonymous comments per post |
| **IAM role** | `transcribe.amazonaws.com` | Lets Transcribe access the audio bucket |
| **Lambda × 6** | Node 20 | Presign, complete submission, list/get post, add comment, process Transcribe job |
| **HTTP API (API Gateway)** | CORS enabled | Public REST-ish routes your Next.js app calls |
| **EventBridge rule** | `aws.transcribe` job state | Invokes the processor when a job completes or fails |

**Stack outputs** (CloudFormation / `cdk deploy`): **`HttpApiUrl`** (put in `NEXT_PUBLIC_API_BASE_URL`), **`AudioBucketName`**, **`ModerationModelId`**.

**Retention:** S3 and DynamoDB use **`RemovalPolicy.RETAIN`**. If you run `cdk destroy`, CloudFormation may remove the Lambdas and API, but **buckets and tables can remain** until you empty/delete them manually (see [Destroy](#destroy)).

There is **no separate RDS or OpenSearch** in this stack—only DynamoDB and S3.

## Prerequisites

- **AWS account**, IAM user or role with CDK deploy permissions.
- **AWS CLI v2** configured (`aws configure`).
- **Node.js 20+**.
- In the **same region** you deploy (default `us-east-1`):
  - Enable **Amazon Bedrock** model access for **Claude 3 Haiku** (or change `MODERATION_MODEL_ID` in `cdk/lib/ethnography-stack.ts`).
  - **Amazon Transcribe** and **EventBridge** available (standard regions).

## One-time: CDK bootstrap

```bash
cd backend/cdk
npm install
npx cdk bootstrap aws://ACCOUNT-ID/REGION
```

(`cdk.json` uses `ts-node` to load `bin/ethnography.ts`; run `npm install` in `backend/cdk` first.)

## Install Lambda dependencies (lockfile for CDK bundling)

```bash
cd backend/lambdas
npm install
```

## Deploy

```bash
cd backend/cdk
npm install
npm run deploy
```

Copy the **HttpApiUrl** output into your Next env as `NEXT_PUBLIC_API_BASE_URL` (no trailing slash).

### Windows: `npm install` / tar errors

If installs fail with `TAR_ENTRY_ERROR`, `ENOENT`, `ENOTEMPTY`, or corrupted cache messages: delete the entire `backend/cdk/node_modules` folder (close editors/terminals using it first), run `npm cache clean --force`, then `npm install` again. Temporarily pause real-time antivirus scanning on the project folder if files stay locked (`EPERM`). A half-installed `aws-cdk-lib` shows up as hundreds of TypeScript errors in `node_modules/aws-cdk-lib`—a clean reinstall fixes that.

## Transcribe returns 500 on `/submissions/complete`

The stack uses **explicit `LanguageCode`** (from the participant’s **language** field on the share form, mapped to Amazon Transcribe codes) and **does not** use automatic language identification. That avoids an AWS rule where **language ID requires KMS encryption** on transcript output.

After pulling changes, **redeploy** the CDK stack so the updated `complete-submission` Lambda is live.

Optional: set **`TRANSCRIBE_LANGUAGE_CODE`** on the **CompleteSubmission** Lambda (e.g. `en-US`) as a fallback when the form language is missing or unmapped.

### `BadRequestException: The specified S3 bucket can't be accessed` (write permission)

**Common code bug:** `StartTranscriptionJob` must pass **`DataAccessRoleArn` inside `JobExecutionSettings`** (with **`AllowDeferredExecution`**). A top-level `DataAccessRoleArn` field is **dropped** by the AWS API client schema, so Transcribe never assumes your role and returns this S3 error.

The stack uses **two buckets**: uploads stay in **`AudioBucket`**; Transcribe writes transcripts to **`TranscriptOutputBucket`**. The **`TranscribeDataAccess`** role has **read-only** on the audio bucket and **read/write** on the transcript bucket, plus **`s3:GetBucketLocation`** on both, trust **`transcribe.amazonaws.com`**, and the **CompleteSubmission** Lambda has **`iam:PassRole`** for that role.

Redeploy after changes. Confirm stack region matches both buckets. Stack output **`TranscriptBucketName`** is the output bucket.

## Dev: skip LLM moderation

If Bedrock is not ready yet, set environment variable on **ProcessTranscribeFn** in the AWS console (or extend the CDK stack):

- `SKIP_MODERATION` = `true`  
  → transcripts still publish with a generic title/summary (see `lambdas/lib/moderation.ts`).

## API routes (HTTP API)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/uploads/presign` | Body `{ "contentType": "audio/webm" }` → presigned PUT URL + `submissionId` + `audioKey` |
| POST | `/submissions/complete` | After S3 upload: metadata, `consentGiven`, optional `latitude` / `longitude` / `locationSource` |
| GET | `/posts` | List published posts |
| GET | `/posts/{id}` | Post + comments |
| POST | `/posts/{id}/comments` | Body `{ "text": "..." }` — anonymous |

## Frontend behavior (already wired)

- **Share** → metadata step includes optional **browser geolocation** (user gesture + browser consent). Coordinates are sent with `submissions/complete` as `latitude` / `longitude`.
- **Explore → Discussion** loads thread detail and supports **anonymous comments** via `postAnonymousComment`.
- **Submit** uses presign → PUT → complete when `NEXT_PUBLIC_API_BASE_URL` is set; otherwise the existing mock path runs.

## Operational notes

- **Transcribe + WebM**: codec support varies; if jobs fail, try **MP3** or **WAV** from the recorder.
- **Comments** are open to the internet — add **WAF** / rate limits on API Gateway when you go public.
- **PII / IRB**: tune `lambdas/lib/guidelines.ts` and consider **Comprehend** or human review for production.

## Project layout

```
backend/
  cdk/              # AWS CDK app (deploy this)
  lambdas/          # Lambda source (bundled by CDK)
```

## Destroy

```bash
cd backend/cdk
npx cdk destroy
```

Empty **both S3 buckets** (audio + transcripts) first if `RETAIN` policies block deletion.
