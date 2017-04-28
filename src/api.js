import axios from 'axios';
import qs from 'qs';

const appendQuery = (uri, param) => {
  let url = uri;
  url += (url.split('?')[1] ? '&' : '?') + param;
  return url;
}

const get = (url, data) => {
  const param = data ? qs.stringify(data) : '';
  const fullUri = appendQuery(finalUrl, param);
  return new Promise((resolve) => {
    axios.get(fullUri)
      .then(response => resolve(response))
      .catch(error => resolve(error.response));
  });
};

const post = (url, body) => {
  return new Promise((resolve) => {
    axios.post(url, body)
      .then(response => resolve(response))
      .catch(error => resolve(error.response));
  });
};

export default {
  get,
  post,
};
