const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');
const UnauthorizedError = require('../errors/unauthorized');

const userSchema = new mongoose.Schema({
  name: {
    minlength: 2,
    maxlength: 30,
    type: String,
  },
  email: {
    unique: true,
    required: true,
    type: String,
    validate: {
      validator: (email) => validator.isEmail(email),
      message: 'Некорректный email',
    },
  },
  password: {
    type: String,
    select: false,
    required: true,
  },
});

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new UnauthorizedError('Неправильные почта или пароль'));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new UnauthorizedError('Неправильные почта или пароль'));
          }

          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
