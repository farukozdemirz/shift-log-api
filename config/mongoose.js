const mongoose = require('mongoose');
const chalk = require('chalk');

const connectDB = async () => {
  try {
    // MongoDB setup.
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
