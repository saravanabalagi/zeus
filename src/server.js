import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import _ from 'lodash';
import {get, post, setAuthToken, getAuthToken} from './api';
import {twitterConsumerKey, twitterConsumerSecret,
  twitterBaseUri, bingSearchApiKey, apiAiClientAccessToken} from './config';
import {Urls, Locations} from './helpers';
const Bing = require('node-bing-api')({accKey: bingSearchApiKey});
const ApiAi = require('apiai')(apiAiClientAccessToken);
const defaultNewsImage = 'https://s3-ap-southeast-1.amazonaws.com/cshare1/news-default.png';

const port = process.env.PORT || 3000;
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(compression());

// initial setup and gateway into the app
app.get('/ping', (req, res) => {
  // setup for twitter rest api
  const base64BearerRequestToken = new Buffer(`${twitterConsumerKey}:${twitterConsumerSecret}`).toString('base64');
  // make post request to twitter
  post(
    `${twitterBaseUri}${Urls.twitterOauth2BearerTokenUrl()}`,
    'grant_type=client_credentials',
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${base64BearerRequestToken}`,
      },
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
  }).catch((err) => console.log(err));
});

// invalidate bearer access token
app.get('/unping', (req, res) => {
  // setup for unsetup
  const base64BearerRequestToken = new Buffer(`${twitterConsumerKey}:${twitterConsumerSecret}`).toString('base64');
  // make a call to invalidate the token
  post(
    `${twitterBaseUri}${Urls.twitterOauth2InvalidateBearerTokenUrl()}`,
    `access_token=${getAuthToken().split('Bearer ')[1]}`,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${base64BearerRequestToken}`,
      },
    }
  ).then((response) => {
    if (response.status < 400) {
      // delete the twitter auth token from axios default headers
      setAuthToken(null);
      res.status(response.status)
      .send('Successfully invalidated bearer token!');
    } else {
      res.status(response.status)
      .send(response.data.errors);
    }
  }).catch((err) => console.log(err));
});

// get locations for which twitter can provide trends for
app.get('/locations', (req, res) => {
  get(
    `${twitterBaseUri}${Urls.twitterLocationsUrl()}`,
    {}
  ).then((response) => {
    res.send(response.data);
  }).catch((err) => console.log(err));
});


// get trends for a particular location
app.get('/trends/:locationName', (req, res) => {
  const locationObject = _.find(Locations, (location) => {
    return location.name.toLowerCase() === req.params.locationName.toLowerCase();
  });
  if(locationObject) {
    get(
      `${twitterBaseUri}${Urls.twitterPlaceTrendsUrl()}`,
      {id: locationObject.woeid}
    ).then((response) => {
      const nullRemovedTrends = _.forEach(response.data[0].trends, (trend) => {
        if(!trend.tweet_volume) {
          trend.tweet_volume = 0;
        }
      });
      const sortedTrends = _.sortBy(nullRemovedTrends, 'tweet_volume').reverse();
      const countTill = req.query.count || sortedTrends.length;
      res.send(sortedTrends.slice(0, countTill));
    }).catch((err) => console.log(err));
  } else {
    res.status(400)
    .send('Incorrect location name!');
  }
});

// get news for a particular query
app.get('/news/:query', (req, res) => {
  Bing.news(`${req.params.query}`, {}, (err, response, body) => {
    if (body) {
      let newsArticles = [];
       _.forEach(body.value, (article) => {
        const newsArticleObject = {
          'provider': article.provider[0].name,
          'title': article.name,
          'description': article.description,
          'url': article.url,
          'urlToImage': article.image
              && article.image.thumbnail.contentUrl || defaultNewsImage,
          'publishedAt': article.datePublished,
        };
        newsArticles.push(newsArticleObject);
      });
      const countTill = req.query.count || body.value.length;
      res.send(newsArticles.slice(0, countTill));
    } else {
      res.send(err);
    }
  });
});

// get entities and intents from sentence
app.get('/ai/:text', (req, res) => {
  const apiAiRequest = ApiAi.textRequest(req.params.text, {
    sessionId: (Math.random() + 1).toString(36).substring(2),
  });
  apiAiRequest.on('response', (response) => {
    const result = {
      'intent': response.result.metadata.intentName,
      'entities': response.result.parameters,
    };
    res.send(result);
  });
  apiAiRequest.on('error', (error) => {
    res.send(error);
  });
  apiAiRequest.end();
});

app.listen(process.env.PORT || port, () => {
  console.log(`Serving now on port ${port} ...`);
});
