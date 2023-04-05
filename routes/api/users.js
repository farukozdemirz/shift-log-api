const router = require('express').Router();
const User = require('../../models/User');
const auth = require('../../config/auth');

/**
 * @route   POST /users
 * @desc    Register new user
 * @access  Public
 */
router.post('/', async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

/**
 * @route   GET /users
 * @desc    Get all users
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (e) {
    res.status(400).send(e);
  }
});

/**
 * @route   GET /users/me
 * @desc    Get logged in user details
 * @access  Private
 */
router.get('/me', auth, async (req, res) => {
  try {
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
