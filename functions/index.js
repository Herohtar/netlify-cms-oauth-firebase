const functions = require('firebase-functions');
const express = require('express');
const simpleOauth = require('simple-oauth2');
const randomstring = require('randomstring');

const oauth = functions.config().oauth;
const oauth_provider = oauth.provider || 'github';

function getScript(mess, content) {
  return `<!doctype html><html><body><script>
  (function() {
    function receiveMessage(e) {
      console.log("receiveMessage %o", e)
      window.opener.postMessage(
        'authorization:github:${mess}:${JSON.stringify(content)}',
        e.origin
      )
      window.removeEventListener("message",receiveMessage,false);
    }
    window.addEventListener("message", receiveMessage, false)
    console.log("Sending message: %o", "github")
    window.opener.postMessage("authorizing:github", "*")
    })()
  </script></body></html>`;
}
/**
 * Setup oauth2 configuration file
 */
const oauth2Config = {
  client: {
    id: oauth.client_id,
    secret: oauth.client_secret,
  },
  auth: {
    tokenHost: oauth.git_hostname || 'https://github.com',
    tokenPath: oauth.token_path || '/login/oauth/access_token',
    authorizePath: oauth.authorize_path || '/login/oauth/authorize',
  },
};
/**
 * Initialize oauth2 client
 */
const oauth2 = new simpleOauth.AuthorizationCode(oauth2Config);
/**
 * Initialize express.js server
 */
const oauthApp = express();
/**
 * [GET] /auth
 */
oauthApp.get('/auth', (req, res) => {
  const authorizationUri = oauth2.authorizeURL({
    redirect_uri: oauth.redirect_url,
    scope: oauth.scopes || 'repo,user',
    state: randomstring.generate(32),
  });

  res.redirect(authorizationUri);
});
/**
 * [GET] /callback
 */
oauthApp.get('/callback', async (req, res) => {
  var options = {
    code: req.query.code,
  };

  if (oauth_provider === 'gitlab') {
    options.client_id = oauth.client_id;
    options.client_secret = oauth.client_secret;
    options.grant_type = 'authorization_code';
    options.redirect_uri = oauth.redirect_url;
  }

  try {
    const result = await oauth2.getToken(options);
    const token = oauth2.createToken(result.token);

    return res.send(
      getScript('success', {
        token: token.token.access_token,
        provider: oauth_provider,
      })
    );
  } catch (error) {
    console.error('Access Token Error', error.message);
    res.send(getScript('error', error));
  }
});
/**
 * [GET] /success
 */
oauthApp.get('/success', (req, res) => {
  res.sendStatus(200);
});
/**
 * [GET] /
 */
oauthApp.get('/', (req, res) => {
  res.redirect(301, `/oauth/auth`);
});

exports.oauth = functions.https.onRequest(oauthApp);
