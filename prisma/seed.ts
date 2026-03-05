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

// Public domain / CC sample videos from Google's test bucket
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
  {
    title: "For Bigger Fun",
    description: "A fun-filled promotional clip with colorful visuals.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    genreNames: ["Music"],
  },
  {
    title: "For Bigger Joyrides",
    description: "A joyride-themed promo with fast cars and scenic routes.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    genreNames: ["Sports", "Action & Adventure"],
  },
  {
    title: "For Bigger Meltdowns",
    description: "An intense promo clip with explosive drama.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    genreNames: ["Action & Adventure"],
  },
  {
    title: "Sintel",
    description:
      "A lonely young woman searches for her pet dragon. CC BY 3.0 — Blender Foundation.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    genreNames: ["Movies", "Action & Adventure", "Anime"],
  },
  {
    title: "Volkswagen GTI Review",
    description: "Detailed review of the Volkswagen GTI performance hatchback.",
    videoUrl:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
    genreNames: ["Sports"],
  },
  {
    title: "We Are Going on Bullrun",
    description: "A road rally documentary following competitors on the Bullrun.",
    videoUrl:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    genreNames: ["Sports", "Action & Adventure"],
  },
  {
    title: "What Care Can You Get for a Grand",
    description: "Exploring what cars you can buy for just one thousand dollars.",
    videoUrl:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
    genreNames: ["Culture"],
  },
  {
    title: "Big Buck Bunny — Director's Cut",
    description:
      "Extended director's cut of the award-winning open-source animation.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    genreNames: ["Movies"],
  },
  {
    title: "Elephant Dream Remastered",
    description: "Remastered version of the classic Blender short film in HD.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    genreNames: ["Movies", "Culture"],
  },
  {
    title: "Tears of Steel — Behind the Scenes",
    description: "A behind-the-scenes look at the making of Tears of Steel.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    genreNames: ["Movies", "Podcasts"],
  },
  {
    title: "Gaming Highlights Compilation",
    description: "Top gaming moments from streamers around the world.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    genreNames: ["Gaming"],
  },
  {
    title: "Late Night Jazz Session",
    description: "A mellow late-night jazz performance recorded live.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    genreNames: ["Music", "Jams"],
  },
  {
    title: "Horror Short: The Basement",
    description: "A chilling 5-minute short film about what lurks below.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    genreNames: ["Horror", "Movies"],
  },
  {
    title: "Anime Opening Compilation 2026",
    description: "The best anime openings of the year, ranked by fan votes.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    genreNames: ["Anime", "Music"],
  },
  {
    title: "Sketch Comedy: Office Life",
    description: "A hilarious sketch about the absurdities of working in an office.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    genreNames: ["Sketch Show"],
  },
  {
    title: "Podcast Episode: Future of AI",
    description: "Deep dive into what AI means for the next decade.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    genreNames: ["Podcasts", "Culture"],
  },
  {
    title: "Mountain Biking in the Alps",
    description: "Breathtaking downhill mountain biking footage from the Swiss Alps.",
    videoUrl:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    genreNames: ["Sports", "Action & Adventure"],
  },
  {
    title: "Street Culture Documentary",
    description: "Exploring urban street art and its influence on modern culture.",
    videoUrl:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
    genreNames: ["Culture"],
  },
  {
    title: "Sunday Morning Jam",
    description: "A relaxed acoustic jam session recorded on a sunny morning.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    genreNames: ["Music", "Jams"],
  },
  {
    title: "Retro Gaming Marathon",
    description: "24 hours of retro gaming classics, from Pac-Man to Doom.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    genreNames: ["Gaming"],
  },
  {
    title: "Sintel — Fan Commentary",
    description: "Fan-made audio commentary over the Blender Foundation short film Sintel.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    genreNames: ["Movies", "Podcasts"],
  },
  {
    title: "Drift King: Tokyo Nights",
    description: "Insane drifting footage from the streets of Tokyo at night.",
    videoUrl:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
    genreNames: ["Sports", "Action & Adventure"],
  },
  {
    title: "Horror Anthology: Three Tales",
    description: "Three short horror stories woven into one terrifying anthology.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    genreNames: ["Horror", "Movies"],
  },
  {
    title: "Top 10 Anime Fights of All Time",
    description: "Counting down the most epic anime fight scenes ever animated.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    genreNames: ["Anime", "Action & Adventure"],
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
  for (let i = 0; i < sampleVideos.length; i++) {
    const v = sampleVideos[i];
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
          thumbnail: `https://picsum.photos/seed/mepipe${i}/640/360`,
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

