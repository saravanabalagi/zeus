import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import compression from 'compression';
import favicon from 'serve-favicon';
import { get, post } from './api';
import Config from './config';

const port = 3000;
const app = express();
use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(favicon(path.join(__dirname, 'favicon.ico')));
app.use(compression());

app.get('/ping', (req, res) => {
  res.send('hello!');
});

app.listen(process.env.PORT || port, () => {
  console.log('Serving now...');
});
