const Lokka = require('lokka').Lokka;
const Transport = require('lokka-transport-http').Transport;
const dco = require('./lib/dco');

const defaults = {
  success: {
    state: 'success',
    description: 'All commits have a DCO sign-off from the author'
  },
  failure: {
    state: 'failure',
    description: 'All commits must have a DCO sign-off from the author',
    target_url: 'https://developercertificate.org/'
  }
};

module.exports = robot => {
  robot.on('pull_request.opened', check);
  robot.on('pull_request.synchronize', check);

  async function check(event, context) {
    const github = await robot.auth(event.payload.installation.id);

    const client = new Lokka({
      transport: new Transport('http://api.github.com/graphql', {
        headers: {'Authorization': `token ${github.auth.token}`}
      })
    });

    const result = await client.query(`
      query commitMessages($owner: String!, $repo: String!, $number: Int!) {
        repositoryOwner(login: $owner) {
          repository(name: $repo){
            pullRequest(number: $number) {
              commits(first: 100) {
                edges {
                  node {
                    message
                    author { name, email }
                  }
                }
              }
            }
          }
        }
      }
    `, context.issue());

    const signedOff = data.repositoryOwner.repository.pullRequest.commits.every(edge => {
      return dco(edge.node);
    });

    const params = Object.assign({
      sha: pr.head.sha,
      context: 'DCO'
    }, signedOff ? defaults.success : defaults.failure);

    return github.repos.createStatus(context.repo(params));
  }
};
