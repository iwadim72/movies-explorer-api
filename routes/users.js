const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  searchUserById,
  updateUser,
} = require('../controllers/users');

router.get('/me', searchUserById);
router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().email(),
  }),
}), updateUser);

module.exports = router;
