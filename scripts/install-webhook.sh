source .env
curl -d @- -X POST -i -u $githubUsername:$githubToken https://api.github.com/orgs/$githubOrg/hooks <<EOF
{
  "name": "web",
  "active": true,
  "events": [
    "push",
    "pull_request"
  ],
  "config": {
    "url": "https://zhw80cz3wg.execute-api.us-east-1.amazonaws.com/dev/",
    "content_type": "json"
  }
}
EOF
