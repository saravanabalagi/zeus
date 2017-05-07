export default {
  baseApiUrl: process.env.BASE_API_URL || 'https://zeus-news.herokuapp.com',
  twitterBaseUri: 'https://api.twitter.com',
  twitterConsumerKey: process.env.TWITTER_CONSUMER_KEY || 'xfNpvmBbNXQS14gQooVZzMGUq',
  twitterConsumerSecret: process.env.TWITTER_CONSUMER_SECRET || 'Yk4d15kVa7vP8SJ8O3w0JQ1TbUFizKBFtiso2CZZmxHQnsqeHL',
  bingSearchApiKey: process.env.BING_SEARCH_API_KEY || 'fe6823b580914336b27e8525e9049b66',
  newsApiKey: process.env.NEWS_API_KEY || '758b6587060b470bb10d77918b96b8fc',
  apiAiClientAccessToken: process.env.API_AI_CLIENT_ACCESS_TOKEN || '0ac255d56407456ba4f45e5f3680bcf4',
  apiAiDeveloperAccessToken: process.env.API_AI_DEVELOPER_ACCESS_TOKEN || '5f1792a9135545eca3a6f09d36454df8',
  defaultNewsSource: process.env.DEFAULT_NEWS_SOURCE || 'google-news',
};
