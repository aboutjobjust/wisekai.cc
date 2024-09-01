import ytdl from '@distube/ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import { R2 } from 'node-cloudflare-r2';
import { createWriteStream, existsSync, mkdirSync, unlink } from 'node:fs';
import { dirname, resolve } from 'node:path';

const TMP_ROOT = '.tmp_own/';

export const downloadMP3 = async (videoId: string) => {
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
      console.log('Tmp file was deleted');
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

export const genVoiceMP3 = async (
  slug: string,
  videoId: string,
  start: number,
  during: number,
) => {
  const mp3FilePath = await downloadMP3(videoId);
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
};

export const uploadR2 = async () => {
  const voicePath = resolve(TMP_ROOT, `pre01/01.mp3`);
  const r2 = new R2({
    accountId: import.meta.env.R2_ACCOUNT_ID,
    accessKeyId: import.meta.env.R2_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.R2_SECRET_ACCESS_KEY,
  });
  const bucket = r2.bucket('jochovoice');
  bucket.provideBucketPublicUrl(import.meta.env.PUBLIC_R2_PUBLIC_URL);

  console.log(await bucket.exists());

  const upload = await bucket.uploadFile(
    voicePath,
    'pre01/01.mp3',
    undefined,
    'audio/mpeg',
  );

  console.log(upload);
};
