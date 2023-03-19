const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { Schema } = mongoose;

const userSchema = Schema(
  {
    name: String,
    personelId: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    tokens: [{ token: { type: String, required: true } }],
  },
  { timestamps: true }
);

/**
 * personelId hash middleware.
 */
userSchema.pre('save', async function(next) {
  const user = this;
  if (user.isModified('personelId')) {
    const salt = await bcrypt.genSalt(10);
    user.personelId = await bcrypt.hash(user.personelId, salt);
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
  delete userObject.personelId;
  delete userObject.tokens;

  return userObject;
};

/**
 * Helper method for generating Auth Token
 */
userSchema.methods.generateAuthToken = async function() {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: '20m',
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
