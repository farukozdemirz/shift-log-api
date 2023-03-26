const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { Schema } = mongoose;

const userSchema = Schema(
  {
    userId: { type: Number, unique: true },
    name: String,
    email: { type: String, unique: true, required: true },
    tokens: [{ token: { type: String, required: true } }],
  },
  { timestamps: true }
);
userSchema.pre('save', async function(next) {
  const doc = this;
  if (doc.isNew) {
    const lastUser = await doc.constructor.findOne({}, {}, { sort: { id: -1 } });
    const newId = lastUser && lastUser.userId ? lastUser.userId + 1 : 1;
    doc.userId = newId;
  }
  next();
});
/**
 * Hide properties of Mongoose User object.
 */
userSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();
  delete userObject.updatedAt;
  delete userObject.__v;
  delete userObject.tokens;
  delete userObject._id;

  return userObject;
};

/**
 * Helper method for generating Auth Token
 */
userSchema.methods.generateAuthToken = async function() {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: '90m',
  });
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

/**
 * Helper static method for finding user by credentials
 */
userSchema.statics.findByCredentials = async function(email) {
  const User = this;
  const user = await User.findOne({ email });
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
