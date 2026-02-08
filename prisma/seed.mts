import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      name: "Alice Johnson",
      email: "alice@example.com",
      hashedPassword: password,
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      name: "Bob Smith",
      email: "bob@example.com",
      hashedPassword: password,
    },
  });

  const aliceOutings = [
    { date: new Date("2025-06-15"), location: "Madison River", caught: 8, lost: 3, missed: 2, weather: "Sunny", waterConditions: "Clear", waterTemp: 58, timeSpentMin: 240, notes: "Great day on the Madison. PMDs were hatching mid-morning." },
    { date: new Date("2025-07-02"), location: "Yellowstone River", caught: 5, lost: 4, missed: 3, weather: "Partly Cloudy", waterConditions: "Slightly Stained", waterTemp: 62, timeSpentMin: 180, notes: "Salmonfly hatch was winding down but still caught some nice fish." },
    { date: new Date("2025-07-20"), location: "Gallatin River", caught: 3, lost: 2, missed: 1, weather: "Cloudy", waterConditions: "Normal Flow", waterTemp: 55, timeSpentMin: 150, notes: "Tight canyon section. Small dries worked well." },
    { date: new Date("2025-08-05"), location: "Missouri River", caught: 12, lost: 5, missed: 4, weather: "Sunny", waterConditions: "Clear", waterTemp: 60, timeSpentMin: 360, notes: "Best day of the season! Tricos in the morning, hoppers in the afternoon." },
    { date: new Date("2025-08-22"), location: "Madison River", caught: 6, lost: 2, missed: 0, weather: "Windy", waterConditions: "Normal Flow", waterTemp: 57, timeSpentMin: 200, notes: "Wind made casting tough but streamer fishing was productive." },
    { date: new Date("2025-09-10"), location: "Rock Creek", caught: 4, lost: 3, missed: 2, weather: "Light Rain", waterConditions: "Slightly Stained", waterTemp: 52, timeSpentMin: 180, notes: "October caddis starting to appear." },
    { date: new Date("2025-10-01"), location: "Bighorn River", caught: 10, lost: 4, missed: 1, weather: "Cloudy", waterConditions: "Clear", waterTemp: 50, timeSpentMin: 300, notes: "Fall BWO hatch was incredible. Non-stop action from noon to 4pm." },
  ];

  const bobOutings = [
    { date: new Date("2025-06-20"), location: "Madison River", caught: 4, lost: 5, missed: 3, weather: "Sunny", waterConditions: "Clear", waterTemp: 59, timeSpentMin: 210, notes: "Lost too many fish today. Need to work on hook sets." },
    { date: new Date("2025-07-10"), location: "Bitterroot River", caught: 7, lost: 2, missed: 1, weather: "Partly Cloudy", waterConditions: "Low Water", waterTemp: 64, timeSpentMin: 240, notes: "Float trip with guide. Spruce moths were the hot fly." },
    { date: new Date("2025-08-01"), location: "Clark Fork River", caught: 3, lost: 1, missed: 2, weather: "Rain", waterConditions: "Stained", waterTemp: 56, timeSpentMin: 120, notes: "Tough conditions after the storm but managed a few on streamers." },
    { date: new Date("2025-08-15"), location: "Missouri River", caught: 9, lost: 3, missed: 2, weather: "Sunny", waterConditions: "Clear", waterTemp: 61, timeSpentMin: 300, notes: "Incredible trico hatch. Size 20 parachutes were money." },
    { date: new Date("2025-09-20"), location: "Yellowstone River", caught: 6, lost: 4, missed: 3, weather: "Foggy", waterConditions: "Normal Flow", waterTemp: 53, timeSpentMin: 200, notes: "Fall colors were beautiful. Streamers in the fog." },
    { date: new Date("2025-10-15"), location: "Gallatin River", caught: 2, lost: 1, missed: 0, weather: "Snow", waterConditions: "Clear", waterTemp: 42, timeSpentMin: 90, notes: "First snow of the season. Short but memorable outing." },
  ];

  function calcScore(c: number, l: number, m: number) {
    return c * 5 + l * 3 + m * 1;
  }

  for (const o of aliceOutings) {
    await prisma.outing.create({
      data: { userId: alice.id, ...o, score: calcScore(o.caught, o.lost, o.missed) },
    });
  }

  for (const o of bobOutings) {
    await prisma.outing.create({
      data: { userId: bob.id, ...o, score: calcScore(o.caught, o.lost, o.missed) },
    });
  }

  console.log("Seed data created!");
  console.log("  Users: Alice (alice@example.com) and Bob (bob@example.com)");
  console.log("  Password for both: password123");
  console.log(`  Alice: ${aliceOutings.length} outings`);
  console.log(`  Bob: ${bobOutings.length} outings`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
