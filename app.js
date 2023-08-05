require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const { errors } = require('celebrate');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const app = express();

const { PORT = 3000 } = process.env;

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 150,
// });

app.use(require('./middlewares/cors'));

/// По аналогии с JWT токеном в файле .env содержится корректная ссылка на базу данных
mongoose.connect(process.env.NODE_ENV !== 'production' ? 'mongodb://127.0.0.1:27017/bitfilmsdevdb' : process.env.MONGO_DB, {
  useNewUrlParser: true,
});

app.use(require('./utils/limiter'));

app.use(helmet());
app.use(express.json());

app.use(requestLogger);

app.use('/', require('./routes/index'));

app.use(errorLogger);
app.use(errors());
app.use(require('./middlewares/error'));

app.listen(PORT);
