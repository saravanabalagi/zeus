import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import compression from 'compression';
import favicon from 'serve-favicon';
import { get, post, setAuthToken } from './src/api';
import { twitterConsumerKey, twitterConsumerSecret } from './src/config';

const port = 3001;
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(favicon(path.join(__dirname, 'favicon.ico')));
app.use(compression());

app.get('/ping', (req, res) => {
  //setup for twitter rest api
  const base64BearerRequestToken = new Buffer(`${twitterConsumerKey}:${twitterConsumerSecret}`).toString('base64');
  //set it as Authorization header
  setAuthToken(base64BearerRequestToken);
  //make post request to twitter
  post(
    'api.twitter.com/oauth2/token',
    {'Content-Type': 'application/x-www-form-urlencoded'},
    { 'grant_type': 'client_credentials' }
  )
  .then((response) => {
    res.status(200)
    .send(response.data);
  }).catch(err => console.log(err));
});

app.get('/unping', (req, res) => {
  //delete the twitter auth token
  setAuthToken(null);
});

app.listen(process.env.PORT || port, () => {
  console.log('Serving now...');
});
