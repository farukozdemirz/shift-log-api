const User = require('../../models/User');

class AuthController {
  static async setUserAndToken(body, sessionId, personelId) {
    try {
      let user = await User.findByCredentials(body.email);
      if (!user) {
        user = new User(body);
        await user.save();
      }
      const token = await user.generateAuthToken();
      user.personelId = personelId;
      user.sessionId = sessionId;
      return { user, token };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = AuthController;
