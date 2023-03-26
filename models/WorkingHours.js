const mongoose = require('mongoose');

const { Schema } = mongoose;

const workHoursSchema = Schema(
  {
    personelId: {
      type: String,
      ref: 'User',
      required: true,
    },
    checkInTime: { type: String, required: false },
    checkOutTime: { type: String, required: false },
    workingHours: { type: String, required: false },
    dayNameString: { type: String, required: false },
    date: { type: String, required: false },
  },
  { timestamps: true }
);

/**
 * Hide properties of Mongoose WorkingHours object.
 */
workHoursSchema.methods.toJSON = function() {
  const workingHours = this;
  const workingHoursObject = workingHours.toObject();
  delete workingHoursObject.updatedAt;
  delete workingHoursObject.__v;
  delete workingHoursObject.personelId;

  return workingHoursObject;
};

const WorkingHours = mongoose.model('WorkingHours', workHoursSchema);

module.exports = WorkingHours;
