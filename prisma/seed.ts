import { prisma } from "../src/lib/prisma";

const genres = [
  "Gaming",
  "Music",
  "Culture",
  "Horror",
  "Sports",
  "Movies",
  "Podcasts",
  "Jams",
  "Sketch Show",
  "Anime",
  "Action & Adventure",
];

// Public domain / CC sample videos from Google's test bucket (Blender Foundation)
const sampleVideos = [
  {
    title: "Big Buck Bunny",
    description:
      "A big, slow, gentle giant bunny encounters three tiny bullying rodents. CC BY 3.0 — Blender Foundation.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    genreNames: ["Movies", "Action & Adventure"],
  },
  {
    title: "Elephant Dream",
    description:
      "The first open-source animated film ever made. CC BY 2.5 — Blender Foundation.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    genreNames: ["Movies"],
  },
  {
    title: "Tears of Steel",
    description:
      "A sci-fi short film with real actors and CG environments. CC BY 3.0 — Blender Foundation.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    genreNames: ["Movies", "Action & Adventure"],
  },
  {
    title: "For Bigger Blazes",
    description: "A high-energy promo clip featuring fire and intensity.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    genreNames: ["Action & Adventure"],
  },
  {
    title: "For Bigger Escapes",
    description: "A dramatic chase and escape short.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    genreNames: ["Action & Adventure"],
  },
  {
    title: "Subaru Outback on Street and Dirt",
    description: "Test drive footage of a Subaru Outback on various terrains.",
    videoUrl:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    genreNames: ["Sports"],
  },
];

async function main() {
  console.log("Seeding genres...");
  for (const name of genres) {
    await prisma.genre.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("Seeding sample videos...");
  for (const v of sampleVideos) {
    const genreRecords = await prisma.genre.findMany({
      where: { name: { in: v.genreNames } },
    });
    const genreIds = genreRecords.map((g) => g.id);

    const existing = await prisma.video.findFirst({ where: { title: v.title } });
    if (!existing) {
      await prisma.video.create({
        data: {
          title: v.title,
          description: v.description,
          videoUrl: v.videoUrl,
          genreIds,
        },
      });
    }
  }

  console.log("Done seeding.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

