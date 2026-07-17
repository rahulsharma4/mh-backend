const mongoose = require('mongoose');

const uri = 'mongodb://rahulbhardwajwhatsapp_db_user:lDlgURkoNMAmCtde@ac-z8d0ixa-shard-00-00.p974qol.mongodb.net:27017,ac-z8d0ixa-shard-00-01.p974qol.mongodb.net:27017,ac-z8d0ixa-shard-00-02.p974qol.mongodb.net:27017/mhsolutions?ssl=true&replicaSet=atlas-3a730h-shard-0&authSource=admin&appName=Cluster0';

async function buildIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected!');

    const db = mongoose.connection.db;
    const collection = db.collection('contacts');

    console.log('Building index on { owner: 1, createdAt: -1 } in background...');
    await collection.createIndex({ owner: 1, createdAt: -1 }, { background: true });
    
    console.log('Building index on { assignedTo: 1, createdAt: -1 } in background...');
    await collection.createIndex({ assignedTo: 1, createdAt: -1 }, { background: true });

    console.log('Building index on { createdAt: -1 } in background...');
    await collection.createIndex({ createdAt: -1 }, { background: true });

    console.log('Indexes built successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error building indexes:', error);
    process.exit(1);
  }
}

buildIndexes();
