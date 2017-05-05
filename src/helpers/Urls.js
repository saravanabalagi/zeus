const twitterApiVersion = '1.1';

const twitterOauth2BearerTokenUrl = () => '/oauth2/token';

const twitterOauth2InvalidateBearerTokenUrl = () => '/oauth2/invalidate_token';

const twitterLocationsUrl = () => `/${twitterApiVersion}/trends/available.json`;

const twitterPlaceTrendsUrl = () => `/${twitterApiVersion}/trends/place.json`;

export default {
  twitterOauth2BearerTokenUrl,
  twitterOauth2InvalidateBearerTokenUrl,
  twitterLocationsUrl,
  twitterPlaceTrendsUrl,
};
