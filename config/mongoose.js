const mongoose = require('mongoose');
const chalk = require('chalk');

const connectDB = async () => {
  try {
    // MongoDB setup.
    mongoose.set('useFindAndModify', false);
    mongoose.set('useCreateIndex', true);
    mongoose.set('autoIndex', true);
    mongoose.set('useNewUrlParser', true);
    mongoose.set('useUnifiedTopology', true);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('%s', chalk.green('✓ MongoDB connection established!'));
  } catch (e) {
    console.error(e.message);
    console.log(
      '%s MongoDB connection error. Please make sure MongoDB is running.',
      chalk.red('✗')
    );
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
