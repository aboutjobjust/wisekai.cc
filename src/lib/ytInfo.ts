import ytdl from '@distube/ytdl-core';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const CACHE_FILE_ROOT = '.tmp_own/info/';

async function readCacheFile(id: string) {
  const cachePath = path.resolve(CACHE_FILE_ROOT, `${id}.json`);
  try {
    const data = await fs.readFile(cachePath, 'utf-8');
    return JSON.parse(data) as ytdl.videoInfo;
  } catch (error) {
    return undefined;
  }
}

async function writeCacheFile(id: string, data: ytdl.videoInfo) {
  const cachePath = path.resolve(CACHE_FILE_ROOT, `${id}.json`);
  await fs.writeFile(cachePath, JSON.stringify(data));
}

export async function getYoutubeBasicInfo(id: string) {
  const cache = await readCacheFile(id);

  if (cache) {
    return cache;
  }

  const data = await ytdl.getBasicInfo(`http://www.youtube.com/watch?v=${id}`);

  await writeCacheFile(id, data);

  return data;
}
