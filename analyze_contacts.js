const mongoose = require('mongoose');
const Contact = require('./src/models/contactModel');
require('dotenv').config();

async function analyzeContacts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const total = await Contact.countDocuments();
    console.log(`Total Contacts: ${total}`);

    // Group by creation date (YYYY-MM-DD)
    const byDate = await Contact.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    console.log('\nContacts created by Date:');
    byDate.forEach(d => console.log(`${d._id}: ${d.count}`));

    // Group by createdBy
    const byCreator = await Contact.aggregate([
      {
        $group: {
          _id: "$createdBy",
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('\nContacts by Creator ID:');
    byCreator.forEach(c => console.log(`${c._id}: ${c.count}`));

    // Check if there are any blank or invalid phone numbers
    const invalidPhones = await Contact.countDocuments({ phone: { $in: ['', null, undefined, 'undefined'] } });
    console.log(`\nContacts with invalid/blank phone: ${invalidPhones}`);

    mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

analyzeContacts();
