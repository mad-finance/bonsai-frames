import { createImagesWorker } from "frames.js/middleware/images-worker/next";
// import path from "path";
// import { readFileSync } from "fs";

// Add this line to the route that will be handling images
export const runtime = "edge";

// const topSecret = readFileSync(
//   path.join(path.resolve(process.cwd(), "public"), "TopSecret.ttf")
// );

const imagesRoute = createImagesWorker({
  secret: process.env.IMAGE_WORKER_SECRET,
  // imageOptions: {
  //   fonts: [
  //     {
  //       name: "TopSecret",
  //       data: topSecret,
  //       weight: 400,
  //     },
  //   ],
  // },
});

export const GET = imagesRoute();