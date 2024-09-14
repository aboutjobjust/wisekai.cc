import ytdl from '@distube/ytdl-core';
import type { CollectionEntry } from 'astro:content';
import ffmpeg from 'fluent-ffmpeg';
import { R2 } from 'node-cloudflare-r2';
import { createWriteStream, existsSync, mkdirSync, unlink } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { simpleGit } from 'simple-git';

const TMP_ROOT = '.tmp_own/';
const git = simpleGit();

const dlFromYT = async (videoId: string) => {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const mp3FilePath = resolve(TMP_ROOT, `${videoId}.mp3`);
  const mp4FilePath = resolve(TMP_ROOT, `${videoId}.mp4`);
  const mp3DirPath = dirname(mp3FilePath);

  if (existsSync(mp3FilePath)) {
    return mp3FilePath;
  }

  if (!existsSync(mp3DirPath)) {
    mkdirSync(mp3DirPath, { recursive: true });
  }

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

const shouldReGenVoice = async (slug: string): Promise<boolean> => {
  const voicePath = resolve(TMP_ROOT, `${slug}.mp3`);
  if (!existsSync(voicePath)) {
    return true;
  }

  const status = await git.status();
  const gitPath = `src/content/voice/${slug}.mdx`;

  const isModified = status.modified.includes(gitPath);
  const isNewFile = status.not_added.includes(gitPath);

  return isModified || isNewFile;
};

const genVoice = async (voice: CollectionEntry<'voice'>) => {
  if (!(await shouldReGenVoice(voice.slug))) {
    return;
  }

  const voiceData = voice.data;

  const mp3FilePath = await dlFromYT(voiceData.ytid);
  const voicePath = resolve(TMP_ROOT, `${voice.slug}.mp3`);
  const voiceDirPath = dirname(voicePath);

  if (!existsSync(voiceDirPath)) {
    mkdirSync(voiceDirPath, { recursive: true });
  }

  await new Promise<void>((resolve, reject) => {
    ffmpeg(mp3FilePath)
      .setStartTime(voiceData.start)
      .setDuration(voiceData.during)
      .audioFilters(`volume=${voiceData.gain}dB`)
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

const shouldUpload = async (slug: string): Promise<boolean> => {
  if (import.meta.env.DEV) return false;

  const gitPath = `src/content/voice/${slug}.mdx`;

  const diffs = await git.diffSummary('master', { '--name-only': null });
  const changedFiles = diffs.files.map(({ file }) => file);

  return changedFiles.includes(gitPath);
};

export const uploadR2 = async (slug: string) => {
  if (!(await shouldUpload(slug))) return;

  console.log(`uploading... ${slug}`);

  const voicePath = `${slug}.mp3`;
  const voiceLocalPath = resolve(TMP_ROOT, voicePath);

  const r2 = new R2({
    accountId: import.meta.env.R2_ACCOUNT_ID,
    accessKeyId: import.meta.env.R2_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.R2_SECRET_ACCESS_KEY,
  });
  const bucket = r2.bucket('jochovoice');
  bucket.provideBucketPublicUrl(import.meta.env.PUBLIC_R2_URL);

  await bucket.uploadFile(voiceLocalPath, voicePath, undefined, 'audio/mpeg');
};

export const processVoice = async (voice: CollectionEntry<'voice'>) => {
  await genVoice(voice);
  await uploadR2(voice.slug);
};
