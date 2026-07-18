const mongoose = require('mongoose');
const Contact = require('./src/models/contactModel');
require('dotenv').config();

async function removeDuplicates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // Aggregate to find duplicates
    const duplicates = await Contact.aggregate([
      {
        $group: {
          _id: { phone: "$phone" },
          uniqueIds: { $addToSet: "$_id" },
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    let totalDeleted = 0;

    for (let dup of duplicates) {
      // Keep the first one, delete the rest
      const idsToDelete = dup.uniqueIds.slice(1);
      
      const res = await Contact.deleteMany({ _id: { $in: idsToDelete } });
      totalDeleted += res.deletedCount;
    }

    console.log(`Deleted ${totalDeleted} duplicate contacts.`);
    
    // Ensure index is created for future
    await Contact.collection.createIndex({ phone: 1 }, { unique: true });
    console.log('Unique index on phone created.');

    mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

removeDuplicates();
