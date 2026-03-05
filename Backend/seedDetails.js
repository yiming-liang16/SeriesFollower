import 'dotenv/config';
import { connectDB } from './config/database.js';
import Title from './models/Title.js';
import Movie from './models/Movie.js';
import Series from './models/Series.js';

async function run() {
  await connectDB();

  const inception = await Title.findOne({ name: 'Inception', kind: 'movie' });
  const interstellar = await Title.findOne({ name: 'Interstellar', kind: 'movie' });
  const breakingBad = await Title.findOne({ name: 'Breaking Bad', kind: 'series' });

  if (!inception || !interstellar || !breakingBad) {
    console.log('❌ Missing some titles. Seed titles first.');
    process.exit(1);
  }

  // upsert：有就更新，没有就创建
  await Movie.findOneAndUpdate(
    { titleId: inception._id },
    { titleId: inception._id, duration: 148, director: 'Christopher Nolan' },
    { upsert: true, new: true }
  );

  await Movie.findOneAndUpdate(
    { titleId: interstellar._id },
    { titleId: interstellar._id, duration: 169, director: 'Christopher Nolan' },
    { upsert: true, new: true }
  );

  await Series.findOneAndUpdate(
    { titleId: breakingBad._id },
    { titleId: breakingBad._id, totalSeasons: 5, totalEpisodes: 62, episodeLength: 47 },
    { upsert: true, new: true }
  );

  console.log('✅ Seeded Movie/Series details');
  process.exit(0);
}

run().catch((e) => {
  console.error('❌ seedDetails error:', e);
  process.exit(1);
});
