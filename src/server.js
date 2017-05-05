import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import compression from 'compression';
import favicon from 'serve-favicon';
import _ from 'lodash';
import { get, post, setAuthToken, getAuthToken } from './api';
import { twitterConsumerKey, twitterConsumerSecret, twitterBaseUri } from './config';
import { Urls, Locations } from './helpers';

const port = process.env.PORT || 3000;
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(favicon(path.join(__dirname, 'favicon.ico')));
app.use(compression());

//initial setup and gateway into the app
app.get('/ping', (req, res) => {
  //setup for twitter rest api
  const base64BearerRequestToken = new Buffer(`${twitterConsumerKey}:${twitterConsumerSecret}`).toString('base64');
  //make post request to twitter
  post(
    `${twitterBaseUri}${Urls.twitterOauth2BearerTokenUrl()}`,
    "grant_type=client_credentials",
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${base64BearerRequestToken}`,
      }
    }
  )
  .then((response) => {
    if (response.status < 400 && response.data.token_type === 'bearer') {
      setAuthToken(`Bearer ${response.data.access_token}`);
      res.status(response.status)
      .send('Successfully fetched bearer token!');
    } else {
      res.status(response.status)
      .send(response.data.errors);
    }
  }).catch(err => console.log(err));
});

//invalidate bearer access token
app.get('/unping', (req, res) => {
  //setup for unsetup
  const base64BearerRequestToken = new Buffer(`${twitterConsumerKey}:${twitterConsumerSecret}`).toString('base64');
  //make a call to invalidate the token
  post(
    `${twitterBaseUri}${Urls.twitterOauth2InvalidateBearerTokenUrl()}`,
    `access_token=${getAuthToken().split('Bearer ')[1]}`,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${base64BearerRequestToken}`
      }
    }
  ).then((response) => {
    if (response.status < 400) {
      //delete the twitter auth token from axios default headers
      setAuthToken(null);
      res.status(response.status)
      .send('Successfully invalidated bearer token!');
    } else {
      res.status(response.status)
      .send(response.data.errors);
    }
  }).catch(err => console.log(err));
});

//get locations for which twitter can provide trends for
app.get('/locations', (req, res) => {
  get(
    `${twitterBaseUri}${Urls.twitterLocationsUrl()}`,
    {}
  ).then((response) => {
    res.send(response.data);
  }).catch(err => console.log(err));
});


//get trends for a particular location
app.get('/trends/:locationName', (req, res) => {
  const locationObject = _.find(Locations, (location) => {
    return location.name.toLowerCase() === req.params.locationName.toLowerCase();
  });
  if(locationObject) {
    get(
      `${twitterBaseUri}${Urls.twitterPlaceTrendsUrl()}`,
      {id: locationObject.woeid}
    ).then((response) => {
      res.send(response.data);
    }).catch(err => console.log(err));
  } else {
    res.status(400)
    .send('Incorrect location name!');
  }
});

app.listen(process.env.PORT || port, () => {
  console.log(`Serving now on port ${port} ...`);
});
