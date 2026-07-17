const mongoose = require('mongoose');
const uri = 'mongodb://rahulbhardwajwhatsapp_db_user:lDlgURkoNMAmCtde@ac-z8d0ixa-shard-00-00.p974qol.mongodb.net:27017,ac-z8d0ixa-shard-00-01.p974qol.mongodb.net:27017,ac-z8d0ixa-shard-00-02.p974qol.mongodb.net:27017/mhsolutions?ssl=true&replicaSet=atlas-3a730h-shard-0&authSource=admin&appName=Cluster0';

async function checkSize() {
  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const count = await db.collection('contacts').countDocuments();
    console.log('Total contacts:', count);
    
    // Also try the query with limit vs no limit to see time taken
    const start = Date.now();
    console.log('Fetching first 10...');
    const sample = await db.collection('contacts').find({}).sort({ createdAt: -1 }).limit(10).toArray();
    console.log('Time for 10:', Date.now() - start, 'ms');

    console.log('Fetching all...');
    const start2 = Date.now();
    // Use an aggregation to just get the count of what would be returned if we fetch all, 
    // or just fetch them and see if it hangs
    // Let's just limit to 100k to avoid crashing the test script
    const sampleAll = await db.collection('contacts').find({}).sort({ createdAt: -1 }).limit(100000).toArray();
    console.log('Time for up to 100k:', Date.now() - start2, 'ms. Fetched:', sampleAll.length);
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
checkSize();
