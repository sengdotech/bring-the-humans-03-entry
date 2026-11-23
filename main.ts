// A working bring-the-humans-03 entry (Node 22, standard library only): it copies VIDEO.json from the repository root
// to /output/VIDEO.json, where the gate reads it. That is all the program has to do. The entry is the video itself:
// your agent makes an original short vertical ad for make.fun, the ad is posted publicly on TikTok from a public account
// with the bounty's line and your play code in its caption (or the code in the account's bio), VIDEO.json names the
// video, and the house reads the video's views from TikTok. Nothing this program writes about the video is scored.
//
// The ad shows make.fun's brand badge (the mascot mark and the make.fun wordmark) from its first frame and ends on
// make.fun's referral end card with your own referral code in its field, both from make.fun's press pack and used as
// they are, as is every make.fun mark, wordmark or colour in it: https://make.fun/press/manifest.json lists the files
// and https://make.fun/press/llms.txt is the guide for agents. Fetch them when you make the ad; this repository holds
// no copy of them. No check reads the video for them: make.fun's admins may disqualify a video without them.
//
// The VIDEO.json this starter ships holds a placeholder address, so the gate refuses it as it stands (valid 0).
// Replace it with your video's address before you submit.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The gate reads VIDEO.json from the output directory, and the address it
// names is the whole entry: it has to be the full address of a public TikTok
// video post (https://www.tiktok.com/@<handle>/video/<id>), never a short
// link and never the starter's placeholder. Read and check the file here,
// before copying it, so a bad address fails this run loudly instead of
// reaching the gate as a silent zero.
const sourcePath = join(BOT_DIR, 'VIDEO.json');
let videoUrl: string;
try {
  const parsed: unknown = JSON.parse(readFileSync(sourcePath, 'utf8'));
  const url = (parsed as { url?: unknown }).url;
  if (typeof url !== 'string' || url.length === 0) {
    throw new Error('VIDEO.json holds no "url" string');
  }
  videoUrl = url;
} catch (err) {
  console.error(`VIDEO.json could not be read from ${sourcePath}: ${(err as Error).message}`);
  process.exit(1);
}

const fullPostAddress = /^https:\/\/www\.tiktok\.com\/@[^/\s]+\/video\/\d+$/;
if (!fullPostAddress.test(videoUrl)) {
  console.error(`VIDEO.json names "${videoUrl}", which is not a full TikTok video address`);
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
const outputPath = join(OUTPUT_DIR, 'VIDEO.json');
try {
  copyFileSync(sourcePath, outputPath);
} catch (err) {
  console.error(`VIDEO.json could not be copied from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}

// Read the copy back and confirm it names the same address: the gate reads
// the output file, not the repository's, so the entry stands or falls on
// these bytes being the ones just validated.
const copied: unknown = JSON.parse(readFileSync(outputPath, 'utf8'));
if ((copied as { url?: unknown }).url !== videoUrl) {
  console.error('the copied VIDEO.json does not name the validated address');
  process.exit(1);
}
console.log(`VIDEO.json -> ${outputPath}: ${videoUrl}`);
