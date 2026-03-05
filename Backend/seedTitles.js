import mongoose from 'mongoose';
import 'dotenv/config';
import { connectDB } from './config/database.js';
import Title from './models/Title.js';

const seedTitles = async () => {
  try {
    await connectDB();

    // 清空旧数据（可选）
    await Title.deleteMany({});
    console.log('Old titles cleared');

    const titles = [
      {
        name: 'Inception',
        year: 2010,
        country: 'USA',
        genres: ['Sci-Fi', 'Action'],
        kind: 'movie',
      },
      {
        name: 'Interstellar',
        year: 2014,
        country: 'USA',
        genres: ['Sci-Fi', 'Drama'],
        kind: 'movie',
      },
      {
        name: 'Breaking Bad',
        year: 2008,
        country: 'USA',
        genres: ['Drama', 'Crime'],
        kind: 'series',
      },
      {
        name: 'Game of Thrones',
        year: 2011,
        country: 'USA',
        genres: ['Fantasy', 'Drama'],
        kind: 'series',
      },
      {
        name: 'Parasite',
        year: 2019,
        country: 'Korea',
        genres: ['Thriller', 'Drama'],
        kind: 'movie',
      },
    ];

    const result = await Title.insertMany(titles);

    console.log('✅ Seeded titles:');
    console.log(result);

    process.exit();
  } catch (error) {
    console.error('❌ Error seeding titles:', error);
    process.exit(1);
  }
};

seedTitles();
