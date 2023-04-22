const router = require('express').Router();
const auth = require('../../config/auth');
const AuthService = require('../../src/Service/AuthService');
const ArgeHelper = require('../../src/Helper/ArgeHelper');
const AuthController = require('../../src/Controller/AuthController');
const WorkHoursController = require('../../src/Controller/WorkHoursController');

/**
 * @route   POST /auth/login
 * @desc    Login a user
 * @access  Public
 */

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { tokenInfo, sessionId } = await AuthService.getCsrfToken();
    const loginResponse = await AuthService.login(email, password, tokenInfo, sessionId);
    const errorMessage = ArgeHelper.checkUserErrorMessage(loginResponse);

    const response = {
      status: true,
      message: 'Giriş işlemi başarıyla gerçekleşti.',
    };

    if (errorMessage) {
      response.status = false;
      response.message = decodeURIComponent(errorMessage);
      res.status(400).send(response);
      return;
    }
    const personelId = await AuthService.getArgePersonelId(sessionId);
    const userData = await AuthController.setUserAndToken(req.body, sessionId, personelId);

    // if user is valid, save user to db and generate token
    req.session.sessionId = sessionId;
    const workHours = new WorkHoursController(userData.user);
    await workHours.execute();
    res.status(200).send(userData);
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
  try {
    AuthService.logout(req.session.sessionId);
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
