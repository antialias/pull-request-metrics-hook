## scripts

* `deploy`: build and deploy the server as a lambda function using serverless.js
* `install-webhook`: install the webhook for your github org
* `start`: run the server from `build`
* `build`: build the server to build
* `dev`: run the server locally

# environment variables
for the full list of required environment variables see `.env.example`.

`port`: port on which to run the webserver when testing locally
`githubGraphQLApi`: Github Graphql API endpoint. Use: `https://api.github.com/graphql`
`githubToken`: [github personal access token](https://github.com/settings/tokens/) with the following permissions: `repo`, `read:org`, `read:public_key`, `user`, `read:gpg_key`: 
`githubUsername`: used for auth when installing the webhook
`githubOrg`: org name under which the webhook listener for pull requests will be installed
`metricName`: name of the metric that we are shipping to datadog
`datadogApiKey`: used when sending custom metrics to datadog through their rest API
