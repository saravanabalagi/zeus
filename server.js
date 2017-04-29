import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import compression from 'compression';
import favicon from 'serve-favicon';
import { get, post, setAuthToken } from './src/api';
import { twitterConsumerKey, twitterConsumerSecret } from './src/config';

const port = process.env.PORT || 3000;
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(favicon(path.join(__dirname, 'favicon.ico')));
app.use(compression());

app.get('/ping', (req, res) => {
  //setup for twitter rest api
  const base64BearerRequestToken = new Buffer(`${twitterConsumerKey}:${twitterConsumerSecret}`).toString('base64');
  //make post request to twitter
  post(
    'https://api.twitter.com/oauth2/token',
    "grant_type=client_credentials",
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${base64BearerRequestToken}`,
      }
    }
  )
  .then((response) => {
    if (response.data.token_type === 'bearer') {
      setAuthToken(response.data.access_token);
      res.status(200)
      .send('Successfully fetched bearer token!');
    } else {
      res.status(404)
      .send('Failed to get bearer token!');
    }
  }).catch(err => console.log(err));
});

app.get('/unping', (req, res) => {
  //delete the twitter auth token
  setAuthToken(null);
});

app.listen(process.env.PORT || port, () => {
  console.log('Serving now...');
});
