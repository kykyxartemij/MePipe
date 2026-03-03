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

async function main() {
  console.log("Seeding genres...");

  for (const name of genres) {
    await prisma.genre.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("Done seeding.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
