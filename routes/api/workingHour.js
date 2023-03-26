const router = require('express').Router();
const WorkingHours = require('../../models/WorkingHours');
const auth = require('../../config/auth');

/**
 * @route   GET /workingHours/get
 * @access  Private
 */

router.post('/get', auth, async (req, res) => {
  try {
    const { start, end } = req.body;
    const getWorkingHour = await WorkingHours.find({
      date: {
        $gte: start,
        $lte: end,
      },
      userId: req.user.userId,
    }).sort('date');
    return res.send(getWorkingHour);
  } catch (e) {
    return res.status(400).send(e.message);
  }
});

module.exports = router;
