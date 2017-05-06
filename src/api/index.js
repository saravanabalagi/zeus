import axios from 'axios';
import qs from 'qs';

const appendQuery = (uri, param) => {
  let url = uri;
  url += (url.split('?')[1] ? '&' : '?') + param;
  return url;
};

const get = (url, data, options = {}) => {
  const param = data ? qs.stringify(data) : '';
  const fullUri = appendQuery(url, param);
  return new Promise((resolve) => {
    axios.get(fullUri, options)
      .then((response) => resolve(response))
      .catch((error) => resolve(error.response));
  });
};

const post = (url, body, options = {}) => {
  return new Promise((resolve) => {
    axios.post(url, body, options)
      .then((response) => resolve(response))
      .catch((error) => resolve(error.response));
  });
};

const setAuthToken = (token) => {
  if (token) axios.defaults.headers.Authorization = token;
  else delete axios.defaults.headers.Authorization;
};

const getAuthToken = () => {
  return axios.defaults.headers.Authorization;
};

export default {
  get,
  post,
  setAuthToken,
  getAuthToken,
};
