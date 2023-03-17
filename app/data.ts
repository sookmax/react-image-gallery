import seedrandom from "seedrandom";

const RANDOM_SEED = process.env.NEXT_PUBLIC_RANDOM_SEED;

export type ImgData = {
  id: number;
  srcSet: string;
  aspectRatio: number;
  placeholderUrl: string;
};

export function getImage(id: number): ImgData | undefined {
  if (id < 0 || id > Number.MAX_SAFE_INTEGER) return undefined;

  // https://www.npmjs.com/package/seedrandom
  const rng = seedrandom(`${RANDOM_SEED}-${id}`);
  const aspectRatio = generateAspectRatio(rng());
  return {
    id,
    srcSet: getImageSrcSet(
      id,
      [3840, 2560, 2048, 1920, 1536, 1280, 1024, 768, 512],
      aspectRatio
    ),
    aspectRatio,
    placeholderUrl: getImageUrl(id, 4, aspectRatio),
  };
}

const MIN_ASPECT_RATIO = 0.8;
const MAX_ASPECT_RATIO = 2.5;

function generateAspectRatio(randomNumber: number) {
  return (
    // Math.random() * (MAX_ASPECT_RATIO - MIN_ASPECT_RATIO) + MIN_ASPECT_RATIO
    randomNumber * (MAX_ASPECT_RATIO - MIN_ASPECT_RATIO) + MIN_ASPECT_RATIO
  );
}

function calculateHeight(width: number, aspectRatio: number) {
  return Math.floor(width / aspectRatio);
}

function getImageUrl(id: number, width: number, aspect: number) {
  return `https://picsum.photos/seed/random-${RANDOM_SEED}-${id}/${width}/${calculateHeight(
    width,
    aspect
  )}.webp`;
}

function getImageSrcSet(id: number, widths: number[], aspect: number) {
  return widths
    .map((width) => {
      return `${getImageUrl(id, width, aspect)} ${width}w`;
    })
    .join(", ");
}
