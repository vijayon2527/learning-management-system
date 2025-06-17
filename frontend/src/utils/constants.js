export const dilip_url = getMysiteUrl();

function getMysiteUrl() {
  const env = process.env.REACT_APP_ENVIRONMENT || process.env.NODE_ENV || 'development';

  // Define URLs for each environment
  const urls = {
    development: 'http://127.0.0.1:8000/',
    production: 'https://dilips.pythonanywhere.com/'
  };

  // Choose the appropriate URL based on the environment
  return urls[env] || urls.development;
}
