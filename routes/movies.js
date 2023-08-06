const router = require('express').Router();
const mongoose = require('mongoose');
const { celebrate, Joi } = require('celebrate');
const BadRequest = require('../errors/bad-request');
const {
  getMovies, createMovie, deleteMovie,
} = require('../controllers/movies');
const regUrl = require('../utils/constants');

const validationId = (value) => {
  if (!mongoose.isValidObjectId(value)) {
    throw new BadRequest('Переданы некоректные данные при удалении фильма');
  } else { return value; }
};

router.get('/', getMovies);
router.post('/', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required().pattern(regUrl),
    trailerLink: Joi.string().required().pattern(regUrl),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
    thumbnail: Joi.string().required().pattern(regUrl),
    movieId: Joi.number().required(),
  }),
}), createMovie);
router.delete('/:movieId', celebrate({
  params: Joi.object().keys({
    movieId: Joi.string().custom(validationId),
  }),
}), deleteMovie);

module.exports = router;
