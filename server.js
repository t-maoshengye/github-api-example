const express = require('express');
const { Octokit } = require("@octokit/rest");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT || 5000;

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// list all my repos
app.get('/api/repos', async (req, res) => {
  try {
    const response = await octokit.repos.listForAuthenticatedUser({
      visibility: 'public',
      affiliation: 'owner',
    });
    res.send(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching repos.');
  }
});

// list files in the repo
app.get('/api/repos/:owner/:repo', async (req, res) => {
  const { owner, repo } = req.params;

  try {
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path: '',
    });

    if (response.status !== 200) {
      res.status(response.status).json({ error: `GitHub API request failed: ${response.status}` });
      return;
    }

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// list the files under the directory in the repo
app.get('/api/repos/:owner/:repo/:path', async (req, res) => {
  const { owner, repo, path } = req.params;
  // decode the base64 encoded path
  const decodedPath = Buffer.from(path, 'base64').toString();

  try {
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path: decodedPath,
    });

    if (response.status !== 200) {
      res.status(response.status).json({ error: `GitHub API request failed: ${response.status}` });
      return;
    }

    // return the content of the file
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/file/save/branch/pr', async (req, res) => {
  const { owner, repo, path, content, newBranch, commitMessage, pullRequestTitle } = req.body;

  try {
    // get default branch
    const { data: repoData } = await octokit.repos.get({
      owner,
      repo,
    });
    const defaultBranch = String(repoData.default_branch);

    // get branch ref
    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${defaultBranch}`,
    });

    // create new branch
    await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${newBranch}`,
      sha: refData.object.sha,
    });

    // Get file sha from new branch
    const { data: fileData } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: newBranch
    });

    // commit to new branch
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      branch: newBranch,
      message: commitMessage,
      content: Buffer.from(content).toString('base64'),
      sha: fileData.sha,
    });

    // console.log(owner, repo, path, newBranch,commitMessage, Buffer.from(content).toString('base64'), fileData.sha)

    // create a pull request
    await octokit.pulls.create({
      owner,
      repo,
      title: pullRequestTitle,
      head: newBranch,
      base: defaultBranch,
    });

  } catch (error) {
    res.status(500).send({ error: error.toString() });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
