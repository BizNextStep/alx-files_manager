import Queue from 'bull';
import imageThumbnail from 'image-thumbnail';
import { promises as fs } from 'fs';
import { ObjectID } from 'mongodb';
import dbClient from './utils/db';

const fileQueue = new Queue('fileQueue', 'redis://127.0.0.1:6379');
const userQueue = new Queue('userQueue', 'redis://127.0.0.1:6379');

// Function to generate a thumbnail
async function thumbNail(width, localPath) {
  try {
    const thumbnail = await imageThumbnail(localPath, { width });
    return thumbnail;
  } catch (error) {
    console.error(`Error generating thumbnail for width ${width}:`, error);
    throw error;
  }
}

// Process file queue
fileQueue.process(async (job, done) => {
  console.log('Processing file queue...');
  const { fileId, userId } = job.data;

  if (!fileId) {
    return done(new Error('Missing fileId'));
  }
  if (!userId) {
    return done(new Error('Missing userId'));
  }

  console.log(`Processing fileId: ${fileId}, userId: ${userId}`);
  const files = dbClient.db.collection('files');
  const idObject = new ObjectID(fileId);

  try {
    const file = await files.findOne({ _id: idObject });
    if (!file) {
      console.log('File not found');
      return done(new Error('File not found'));
    }

    const fileName = file.localPath;

    try {
      const thumbnail500 = await thumbNail(500, fileName);
      const thumbnail250 = await thumbNail(250, fileName);
      const thumbnail100 = await thumbNail(100, fileName);

      console.log('Writing files to system');
      await fs.writeFile(`${file.localPath}_500`, thumbnail500);
      await fs.writeFile(`${file.localPath}_250`, thumbnail250);
      await fs.writeFile(`${file.localPath}_100`, thumbnail100);

      done();
    } catch (error) {
      console.error('Error writing thumbnails to filesystem:', error);
      done(error);
    }
  } catch (error) {
    console.error('Error fetching file from DB:', error);
    done(error);
  }
});

// Process user queue
userQueue.process(async (job, done) => {
  const { userId } = job.data;

  if (!userId) {
    return done(new Error('Missing userId'));
  }

  try {
    const users = dbClient.db.collection('users');
    const idObject = new ObjectID(userId);
    const user = await users.findOne({ _id: idObject });

    if (user) {
      console.log(`Welcome ${user.email}!`);
      done();
    } else {
      return done(new Error('User not found'));
    }
  } catch (error) {
    console.error('Error fetching user from DB:', error);
    done(error);
  }
});

