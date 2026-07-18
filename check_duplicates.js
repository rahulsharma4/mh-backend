const mongoose = require('mongoose');
const Contact = require('./src/models/contactModel');
require('dotenv').config();

async function checkDuplicates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const total = await Contact.countDocuments();
    const uniquePhones = await Contact.distinct('phone');
    
    console.log(`Total Contacts: ${total}`);
    console.log(`Unique Phone Numbers: ${uniquePhones.length}`);

    mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

checkDuplicates();
