const request = require('request');
const path = require('path');

class RedditImageUrlFetcher {
  static fetch(imageSourceEndpoint) {
    return new Promise(function(resolve, reject) {
      request(imageSourceEndpoint, function (error, response, body) {
        const jsonContent = JSON.parse(body)
        const imageUrls = jsonContent['data']['children'].map(child => {
          return child['data']['url']
        }).filter(url => {
          return path.extname(url) == '.jpg' || path.extname(url) == '.png'
        })
        resolve(imageUrls);
      });
    })
  }
}

module.exports = RedditImageUrlFetcher;
