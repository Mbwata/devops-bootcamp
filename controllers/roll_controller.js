const express = require('express');
const router = express.Router();
const Die = require('../models/die');
const { db } = require('../lib/db');
const logger = require('../lib/logger');

router.get('/', async (req, res) => {
  const profiler = logger.startTimer();
  let die = new Die(req.query.sides);
  let roll = die.roll();
  logger.info('Roll value obtained', { numSides: die.sides, rolled: roll });
  let message = `A die with ${die.sides} sides just rolled a ${roll}.`;
  await saveRoll(die.sides, roll);

  profiler.done({ message: 'Die roll complete!' });
  res.send(message)
});


let saveRoll = async function (sides, rollResult) {
  try {
    await db.none(`INSERT INTO roll_history(die_sides, result) VALUES (${sides}, ${rollResult});`);
  } catch (e) {
    logger.error('Failed to log roll history.');
    logger.error(e);
  }
};

module.exports = router;
