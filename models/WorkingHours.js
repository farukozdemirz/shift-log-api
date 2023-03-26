const mongoose = require('mongoose');

const { Schema } = mongoose;

const workHoursSchema = Schema(
  {
    checkInTime: { type: String, required: false },
    checkOutTime: { type: String, required: false },
    workingHours: { type: String, required: false },
    dayNameString: { type: String, required: false },
    date: { type: String, required: false },
    userId: { type: Number, ref: 'User', required: true },
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
  delete workingHoursObject.userId;

  return workingHoursObject;
};

const WorkingHours = mongoose.model('WorkingHours', workHoursSchema);

module.exports = WorkingHours;
