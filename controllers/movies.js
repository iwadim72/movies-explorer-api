const mongoose = require('mongoose');
const Movie = require('../models/movie');
const NotFoundError = require('../errors/not-found-err');
const BadRequest = require('../errors/bad-request');
const ForbiddenError = require('../errors/forbiddenError');

module.exports.getMovies = (req, res, next) => {
  const owner = req.user;
  Movie.find({ owner })
    .then((cards) => res.send({ data: cards }))
    .catch((err) => next(err));
};

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;

  const owner = req.user;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner,
  })
    .then((movie) => res.send({ data: movie }))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        console.log(err);
        next(new BadRequest('Переданы некорректные данные при создании фильма'));
      } else {
        next(err);
      }
    });
};

module.exports.deleteMovie = (req, res, next) => {
  const { movieId } = req.params;
  const userId = req.user._id;

  Movie.findById({ _id: movieId })
    .then((movieInfo) => {
      if (movieInfo) {
        if (movieInfo.owner._id.toString() === userId) {
          Movie.findByIdAndRemove({ _id: movieId })
            .then((movie) => {
              if (movie) {
                res.send({ data: movieId });
              }
            })
            .catch((err) => next(err));
        } else { next(new ForbiddenError('Вы не создатель фильма')); }
      } else {
        throw new NotFoundError('Фильм с указанным _id не найден.');
      }
    })
    .catch((err) => {
      if (err instanceof mongoose.CastError) {
        next(new BadRequest('Переданы некоректные данные при удалении фильма'));
      } else {
        next(err);
      }
    });
};
