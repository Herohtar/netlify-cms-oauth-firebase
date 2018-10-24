# netlify-cms-oauth-firebase

This is a Firebase Cloud Function that allows [Netlify CMS](https://www.netlifycms.org/) to authenticate with GitHub or GitLab via OAuth2.

## Setup
### 0) Prerequisites
These instructions require that you have created a [Firebase](https://firebase.google.com/) project and have installed and configured the [Firebase CLI Tools](https://github.com/firebase/firebase-tools). See the [Firebase CLI Reference](https://firebase.google.com/docs/cli/) for more details.

### 1) Get the code
Clone the repository and install dependencies:
```
git clone https://github.com/Herohtar/netlify-cms-oauth-firebase
cd netlify-cms-oauth-firebase/functions
npm i
```

### 2) Create an OAuth app
You will need an OAuth app to authenticate with. For GitHub, the instructions can be found in the [GitHub Developer Documentation](https://developer.github.com/apps/building-oauth-apps/creating-an-oauth-app/).

For now, the values that you provide for the fields do not matter. The **authorization callback URL** will need to be configured once you have the Firebase Function URL in order for the service to work.

### 3) Configure the Firebase environment
Tell Firebase which project to use:
```
firebase use your-project-id
```

Set the `oauth.client_id` and `oauth.client_secret` Firebase environment variables using the values from the GitHub OAuth app:
```
firebase functions:config:set oauth.client_id=yourclientid oauth.client_secret=yourclientsecret
```

For GitHub Enterprise and GitLab you will need to set the `oauth.git_hostname` environment variable.

For GitLab you will also need to set the following additional environment variables as specified:
```
oauth.provider=gitlab
oauth.scopes=api
oauth.authorize_path=/oauth/authorize
oauth.token_path=/oauth/token
```

### 4) Deploy the function
Deploy the function to Firebase:
```
firebase deploy --only functions
```

At this point you should update the **authorization callback URL** in your GitHub OAuth app's settings to point to the URL of your Firebase function, which should be of the form: `https://us-central1-your-project-id.cloudfunctions.net/oauth/callback`

### 5) Configure Netlify CMS
Finally, update your Netlify CMS `config.yml` to point to the function:
```yaml
backend:
  name: github # Or gitlab
  repo: username/repo # Your username and repository
  branch: master # Branch to use
  base_url: https://us-central1-your-project-id.cloudfunctions.net # The base URL for your Firebase Function
  auth_endpoint: /oauth/auth # The path to the OAuth endpoint of the function
```

## Notes
- The OAuth2 API makes external network requests which requires a Firebase project that has billing enabled.
- Firebase does not handle the function root correctly, so calls to `https://us-central1-your-project-id.cloudfunctions.net/oauth` (no trailing slash) will fail with the error `"Cannot GET null"`. If for some reason you are trying to call the root function, you must use a trailing slash (`https://us-central1-your-project-id.cloudfunctions.net/oauth/`)
