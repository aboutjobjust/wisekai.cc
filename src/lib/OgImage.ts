import fs from 'node:fs';
import satori from 'satori';
import sharp from 'sharp';

export async function getOgImage(text: string) {
  const fontData = (await getFontData()) as ArrayBuffer;
  const baseImage = fs.readFileSync('./src/assets/img/ogp-base.png', {
    encoding: 'base64',
  });
  const segmenter = new Intl.Segmenter('ja-JP', { granularity: 'word' });
  const words = segmenter.segment(text);
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          padding: '100px 300px',
          backgroundImage: `url(data:image/png;base64,${baseImage})`,
          backgroundSize: 'cover',
        },
        children: {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexWrap: 'wrap',
              color: '#555',
              fontSize: '35px',
              justifyContent: 'center',
              border: '2px solid rgb(229 231 235)',
              borderRadius: '12px',
              boxShadow:
                '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
              padding: '16px 20px',
            },
            children: Array.from(words).map(({ segment }) => ({
              type: 'div',
              props: {
                style: {
                  display: 'block',
                },
                children: segment,
              },
            })),
          },
        },
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Noto Sans JP',
          data: fontData,
          style: 'normal',
        },
      ],
    },
  );

  return await sharp(Buffer.from(svg)).png().toBuffer();
}

async function getFontData() {
  const API = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@500`;

  const css = await (
    await fetch(API, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1',
      },
    })
  ).text();

  const resource = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/,
  );

  if (!resource) return;

  return await fetch(resource[1]).then((res) => res.arrayBuffer());
}
