# netlify-cms-oauth-firebase

**Note:** The OAuth2 API makes external network requests which requires a Firebase project that has billing enabled.

## 1) Get the code
Clone the repository and install dependencies.
```
git clone https://github.com/Herohtar/netlify-cms-oauth-firebase
cd netlify-cms-oauth-firebase/functions
npm i
```

## 2) Create OAuth App
For GitHub, the instructions can be found in the [GitHub Developer Documentation](https://developer.github.com/apps/building-oauth-apps/creating-an-oauth-app/). The values that you provide for the fields do not matter, except for **authorization callback URL**, which will be updated in a later step.

## 3) Configure Environment
Update `.firebaserc` with your project ID:
```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

Set the `client_id` and `client_secret` Firebase environment variables using the values from the GitHub OAuth app:
```
firebase functions:config:set oauth.client_id=yourclientid oauth.client_secret=yourclientsecret
```

For GitHub Enterprise and GitLab you will need to set the `git_hostname` variable.
For GitLab you will also need to set the following additional variables as specified:
```
oauth_provider=gitlab
scopes=api
oauth_authorize_path=/oauth/authorize
oauth_token_path=/oauth/token
```

## 4) Deploy Function
Deploy the function to Firebase:
```
firebase deploy --only functions
```

At this point you can update your GitHub OAuth app's authorization callback URL to the URL of your Firebase function, which should be of the form `https://us-central1-your-project-id.cloudfunctions.net/oauth/callback`

## 5) Configure Netlify CMS
Finally, update your Netlify CMS `config.yml` to point to the function:
```yaml
backend:
  name: github # Or gitlab
  repo: username/repo # Your username and repository
  branch: master # Branch to use
  base_url: https://us-central1-your-project-id.cloudfunctions.net # The base Firebase Function URL for your project
  auth_endpoint: /oauth/auth # The path to the OAuth endpoint of the function
```

That's it!
