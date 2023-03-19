const router = require('express').Router();
const User = require('../../models/User');
const auth = require('../../config/auth');
const ArgeHelper = require('./ArgeHelper');

/**
 * @route   POST /auth/login
 * @desc    Login a user
 * @access  Public
 */

const setUserAndToken = async body => {
  try {
    let user = await User.findByCredentials(body.email);
    if (!user) {
      user = new User(body);
      await user.save();
    }
    ArgeHelper.setUser(user);
    const token = await user.generateAuthToken();
    return { user, token };
  } catch (error) {
    throw new Error(error.message);
  }
};

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // get token from arge portal
    const tokenInfo = await ArgeHelper.getTokenInfo(email);
    // login to arge portal
    const argeLogin = await ArgeHelper.argePortalLogin(email, password, tokenInfo);
    // check if user is valid
    const errorMessage = ArgeHelper.checkUserErrorMessage(argeLogin);

    const response = {
      status: true,
      message: 'Giriş işlemi başarıyla gerçekleşti.',
    };

    if (errorMessage) {
      // if user is not valid, send error message
      response.status = false;
      response.message = decodeURIComponent(errorMessage);
      res.status(400).send(response);
    } else {
      // if user is valid, save user to db and generate token
      const userActions = await setUserAndToken(req.body);
      const checkWorkingHour = await ArgeHelper.checkWorkingHour(userActions.user);
      res.status(200).send(checkWorkingHour);
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

/**
 * @route   POST /auth/logout
 * @desc    Logout a user
 * @access  Private
 */
router.post('/logout', async (req, res) => {
  const { user } = req;
  try {
    // user.tokens = user.tokens.filter(token => {
    //   return token.token !== req.token;
    // });
    // await user.save();
    // console.log('1234', 1234)
    ArgeHelper.Logout();
    res.send({ message: 'You have successfully logged out!' });
  } catch (e) {
    res.status(400).send(e);
  }
});
/**
 * @route   POST /auth/logoutAll
 * @desc    Logout a user from all devices
 * @access  Private
 */
router.post('/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send({ message: 'You have successfully logged out!' });
  } catch (e) {
    res.status(400).send(e);
  }
});
module.exports = router;
