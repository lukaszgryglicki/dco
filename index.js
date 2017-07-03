const dco = require('./lib/dco');
const dco_is_merge = require('./lib/dco_is_merge');

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
    const pr = event.payload.pull_request;

    const compare = await github.repos.compareCommits(context.repo({
      base: pr.base.sha,
      head: pr.head.sha
    }));

    const mergeCommit = dco_is_merge(compare.data.commits);
    const signedOff = compare.data.commits.every(data => dco(data.commit));

    const params = Object.assign({
      sha: pr.head.sha,
      context: 'DCO'
    }, (signedOff || mergeCommit) ? defaults.success : defaults.failure);

    return github.repos.createStatus(context.repo(params));
  }
};
