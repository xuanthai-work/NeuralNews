# Security Guidelines

## Sensitive Files - DO NOT COMMIT

The following files are ignored by git and should **NEVER** be committed to GitHub:

| File | Purpose |
|------|---------|
| `.env` | Contains actual API keys and secrets |
| `data.json` | Generated content (not sensitive, but auto-generated) |

## Safe to Commit

| File | Purpose |
|------|---------|
| `.env.example` | Template with placeholder values only |
| `requirements.txt` | Python dependencies |
| `package.json` | Node.js dependencies |
| All source code | `.py`, `.tsx`, `.ts`, `.js`, `.css`, `.md` |

## Setting Up Secrets

### Local Development

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your actual credentials:
   ```
   AZURE_OPENAI_ENDPOINT="https://your-actual-resource.openai.azure.com"
   AZURE_OPENAI_API_KEY="your-actual-api-key"
   AZURE_OPENAI_DEPLOYMENT="gpt-35-turbo"
   ```

3. The `.env` file is git-ignored, so it won't be committed.

### GitHub Actions

For the automated scraping workflow, add secrets to your GitHub repository:

1. Go to **Settings** > **Secrets and variables** > **Actions**
2. Click **New repository secret**
3. Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `AZURE_OPENAI_ENDPOINT` | `https://your-resource.openai.azure.com` |
| `AZURE_OPENAI_API_KEY` | Your actual API key |
| `AZURE_OPENAI_DEPLOYMENT` | `gpt-35-turbo` (or your deployment name) |

## Verifying .gitignore

Before pushing, verify that sensitive files won't be committed:

```bash
# Check what files git will track
git status

# Verify .env is NOT in the list
# You should see: .env (in .gitignore)
```

## If You Accidentally Committed Secrets

1. **Immediately rotate the compromised credentials** in Azure OpenAI
2. Remove the secret from git history:
   ```bash
   # If it was just committed and not pushed yet:
   git reset --soft HEAD~1
   git reset .env
   git commit -m "your commit message"
   ```
3. If already pushed, use `git filter-branch` or BFG Repo-Cleaner
4. Force push (only if you're sure no one else cloned):
   ```bash
   git push --force
   ```

## Best Practices

- Never commit `.env` files with real credentials
- Use `.env.example` as a template for collaborators
- Rotate API keys periodically
- Use GitHub Secrets for CI/CD credentials
- Review `git status` before every commit
