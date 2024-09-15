import simpleGit from 'simple-git';

export const genModifiedDate = async (slug: string) => {
  const git = simpleGit();
  const filePath = `src/content/voice/${slug}.mdx`;

  const lastCommit = await git.log({
    file: filePath,
    format: {
      date: '%cI',
    },
  });

  const firstCommit = await git.log({
    file: filePath,
    format: {
      date: '%cI',
    },
    '--reverse': null,
  });

  return {
    createdAt: firstCommit.latest?.date ?? '',
    lastModified: lastCommit.latest?.date ?? '',
  };
};
