import fs from 'fs/promises';
import { exec as execCb } from 'child_process';
import { promisify } from 'util';

const exec = promisify(execCb);

async function run(cmd) {
  const { stdout } = await exec(cmd);
  return stdout.trim();
}

async function getCommits(repo) {
  const url = `https://api.github.com/repos/${repo}/commits`;
  const res = await fetch(url, { headers: { 'User-Agent': 'CommitLessonGenerator' } });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return await res.json();
}

async function getDiff(repo, sha) {
  const url = `https://api.github.com/repos/${repo}/commits/${sha}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'CommitLessonGenerator', 'Accept': 'application/vnd.github.v3.diff' } });
  if (!res.ok) throw new Error(`GitHub diff error: ${res.status}`);
  return await res.text();
}

async function explainDiff(diff) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: `Explain the following git diff line by line:\n${diff}` }]
    })
  });
  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content.trim();
}

async function main() {
  const repo = process.argv[2];
  if (!repo) {
    console.error('Usage: node scripts/generateLessons.js <owner/repo>');
    process.exit(1);
  }

  console.log(`Fetching commits for ${repo}...`);
  const commits = await getCommits(repo);
  for (const commit of commits.slice(0, 3)) {
    const sha = commit.sha;
    console.log(`\n--- Commit ${sha} ---`);
    const diff = await getDiff(repo, sha);
    console.log(diff);
    try {
      const explanation = await explainDiff(diff);
      console.log('\nAI Explanation:\n', explanation);
    } catch (err) {
      console.error('Error from OpenAI:', err.message);
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
