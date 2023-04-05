const mongoose = require('mongoose');

const { Schema } = mongoose;

const workingEntrySchema = Schema(
  {
    type: {
      type: String,
      enum: ['G', 'C'],
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const workHoursSchema = Schema(
  {
    dayNameString: { type: String, required: false },
    date: { type: String, required: false },
    userId: { type: Number, ref: 'User', required: true },
    entries: [
      {
        type: Schema.Types.ObjectId,
        ref: 'WorkingEntry',
      },
    ],
  },
  { timestamps: true }
);

workingEntrySchema.pre('remove', function(next) {
  // "this" keyword refers to the WorkingEntry object being removed
  // Remove all "entries" references from the "WorkingHours" collection that reference this object
  this.model('WorkingHours').updateMany(
    { entries: this._id },
    { $pull: { entries: this._id } },
    { multi: true },
    next
  );
});

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

const WorkingEntry = mongoose.model('WorkingEntry', workingEntrySchema);
const WorkingHours = mongoose.model('WorkingHours', workHoursSchema);

module.exports = {
  WorkingHours,
  WorkingEntry,
};
