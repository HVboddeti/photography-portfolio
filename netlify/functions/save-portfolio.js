const { Octokit } = require('@octokit/rest');

// Netlify Function: Saves portfolio-data.json directly to GitHub
// Env vars required in Netlify UI:
// - GITHUB_TOKEN: PAT with repo:contents scope
// - GITHUB_OWNER: repo owner (e.g., HVboddeti)
// - GITHUB_REPO: repo name (e.g., photography-portfolio)
// - GITHUB_BRANCH: branch to commit to (e.g., main)
// - ADMIN_SAVE_TOKEN: shared secret sent from admin UI
// Optional:
// - TARGET_PATH: path to JSON (default: data/portfolio-data.json)

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // Netlify Identity check: require authenticated user with role "admin"
    const user = context.clientContext && context.clientContext.user;
    const roles = (user && user.app_metadata && user.app_metadata.roles) || [];
    const isAdmin = roles.includes('admin');

    if (!isAdmin) {
        return { statusCode: 401, body: 'Unauthorized' };
    }

    let payload;
    try {
        payload = JSON.parse(event.body);
    } catch (err) {
        return { statusCode: 400, body: 'Invalid JSON' };
    }

    if (!payload || !payload.data) {
        return { statusCode: 400, body: 'Missing data payload' };
    }

    const contentString = JSON.stringify(payload.data, null, 2);

    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || 'main';
    const path = process.env.TARGET_PATH || 'data/portfolio-data.json';

    if (!owner || !repo || !process.env.GITHUB_TOKEN) {
        return { statusCode: 500, body: 'Missing GitHub configuration' };
    }

    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

    try {
        // Get current file SHA (if exists)
        let currentFile;
        try {
            currentFile = await octokit.repos.getContent({ owner, repo, path, ref: branch });
        } catch (err) {
            if (err.status !== 404) throw err; // 404 means new file
        }

        const sha = currentFile && currentFile.data && currentFile.data.sha ? currentFile.data.sha : undefined;

        await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path,
            branch,
            message: payload.commitMessage || 'Update portfolio data via admin',
            content: Buffer.from(contentString).toString('base64'),
            sha
        });

        return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    } catch (err) {
        console.error('GitHub write failed', err);
        return { statusCode: err.status || 500, body: 'GitHub write failed' };
    }
};
