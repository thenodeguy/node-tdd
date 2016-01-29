'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// The FlexitimeSchema will be embedded within the EmployeeSchema.
const FlexitimeSchema = new Schema({

  // _id will be created by default
  date: Date,
  duration: Number,
  note: String,
});

const EmployeeSchema = new Schema({

  // _id will be created by default
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
  firstname: {
    type: String,
    trim: true,
    required: true,
  },
  lastname: {
    type: String,
    trim: true,
    required: true,
  },
  flexitimeaccrued: [FlexitimeSchema],
  flexitimeused: [FlexitimeSchema],
  balance: {
    type: Number,
    required: true,
    default: 0,
  },
  isactive: {
    type: Boolean,
    required: true,
    default: true,
  },
});

// Generate a Model from the Schema.
const Employee = mongoose.model('Employee', EmployeeSchema);
const Flexitime = mongoose.model('Flexitime', FlexitimeSchema);

module.exports.Employee = Employee;
module.exports.Flexitime = Flexitime;
