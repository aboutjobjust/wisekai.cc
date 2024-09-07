import ytdl from '@distube/ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import { R2 } from 'node-cloudflare-r2';
import { createWriteStream, existsSync, mkdirSync, unlink } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { simpleGit } from 'simple-git';

const TMP_ROOT = '.tmp_own/';
const git = simpleGit();
const r2 = new R2({
  accountId: import.meta.env.R2_ACCOUNT_ID,
  accessKeyId: import.meta.env.R2_ACCESS_KEY_ID,
  secretAccessKey: import.meta.env.R2_SECRET_ACCESS_KEY,
});
const bucket = r2.bucket('jochovoice');

const dlFromYT = async (videoId: string) => {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const mp3FilePath = resolve(TMP_ROOT, `${videoId}.mp3`);
  const mp4FilePath = resolve(TMP_ROOT, `${videoId}.mp4`);

  if (existsSync(mp3FilePath)) {
    console.log('This file already exists');
    return mp3FilePath;
  }

  console.log('attempts...');

  const deleteTmp = () => {
    unlink(mp4FilePath, (err) => {
      if (err) return;
      console.log('mp4 file was deleted');
    });
  };

  await new Promise<void>((resolve, reject) => {
    ytdl(videoUrl, { quality: 'highestaudio' })
      .pipe(createWriteStream(mp4FilePath))
      .on('finish', () => {
        resolve();
      })
      .on('error', () => {
        reject();
      });
  });

  await new Promise<void>((resolve, reject) => {
    ffmpeg(mp4FilePath)
      .audioBitrate(128)
      .toFormat('mp3')
      .on('end', () => {
        console.log(`Finished downloading and saving: ${mp3FilePath}`);
        deleteTmp();
        resolve();
      })
      .on('error', (error) => {
        console.error(`Error occurred: ${error.message}`);
        deleteTmp();
        reject();
      })
      .saveToFile(mp3FilePath);
  });

  return mp3FilePath;
};

const uploadR2 = async (slug: string) => {
  const voicePath = `${slug}.mp3`;
  const voiceLocalPath = resolve(TMP_ROOT, voicePath);

  bucket.provideBucketPublicUrl(import.meta.env.PUBLIC_R2_URL);

  const upload = await bucket.uploadFile(
    voiceLocalPath,
    voicePath,
    undefined,
    'audio/mpeg',
  );

  console.log('Successful upload to r2', upload);
};

const shouldReGenVoice = async (slug: string): Promise<boolean> => {
  const status = await git.status();

  const filePath = `src/content/voice/${slug}.mdx`;

  const isModified = status.modified.includes(filePath);
  const isNewFile = status.not_added.includes(filePath);

  return isModified || isNewFile;
};

export const genVoice = async (
  slug: string,
  videoId: string,
  start: number,
  during: number,
) => {
  if (!(await shouldReGenVoice(slug))) {
    console.log('変更されていません');
    return;
  }

  const mp3FilePath = await dlFromYT(videoId);
  const voicePath = resolve(TMP_ROOT, `${slug}.mp3`);
  const voiceDirPath = dirname(voicePath);

  if (!existsSync(voiceDirPath)) {
    mkdirSync(voiceDirPath, { recursive: true });
  }

  await new Promise<void>((resolve, reject) => {
    ffmpeg(mp3FilePath)
      .setStartTime(start)
      .setDuration(during)
      .on('end', () => {
        console.log(`Finished gen voice and saving: ${voicePath}`);
        resolve();
      })
      .on('error', (error) => {
        console.error(`Error occurred: ${error.message}`);
        reject();
      })
      .saveToFile(voicePath);
  });

  if (import.meta.env.PROD) {
    await uploadR2(slug);
  }
};
