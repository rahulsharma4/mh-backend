const mongoose = require('mongoose');

const contactSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    monthlyBill: {
      type: String,
      enum: ['0-1000', '1001-3000', '3001-5000', '5000+', 'Below 1800 rs', '1800- 3000', '3000-5000', 'Above 5000'],
      default: 'Below 1800 rs',
    },
    status: {
      type: String,
      required: true,
      enum: ['New', 'No Answer', 'Call Back', 'Interested', 'Not Interested', 'Converted'],
      default: 'New',
    },
    remarks: {
      type: String,
      default: '',
    },
    callBackDate: {
      type: Date,
    },
    callBackNotified: {
      type: Boolean,
      default: false,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    statusHistory: [
      {
        status: {
          type: String,
          required: true,
        },
        remarks: {
          type: String,
          default: '',
        },
        callBackDate: {
          type: Date,
        },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
