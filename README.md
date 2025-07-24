# GitHub Commit Diff Lesson Generator

This repository contains a simple script that fetches commit diffs from any public GitHub repository and generates line-by-line explanations using OpenAI's API.

## Setup

1. Create a `.env` file or export an environment variable `OPENAI_API_KEY` with your OpenAI API key.
2. Ensure Node.js 18+ is installed (includes the global `fetch` API).

## Usage

```bash
npm run generate owner/repo
```

Replace `owner/repo` with the GitHub repository name (for example `vercel/next.js`).

The script will fetch the latest three commits, display their diffs, and request an explanation from OpenAI for each.

## Notes

- Only public repositories are supported.
- Network access is required for GitHub and OpenAI API requests.

