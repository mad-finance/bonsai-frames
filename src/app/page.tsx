import { fetchMetadata } from "frames.js/next";

export async function generateMetadata() {
  return {
    title: "Bonsai Frames",
    // provide a full URL to your /frames endpoint
    other: await fetchMetadata(
      new URL(
        "/cashtags",
        process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000"
      )
    ),
  };
}

export default function Page() {
  return <span>Bonsai Frames</span>;
}