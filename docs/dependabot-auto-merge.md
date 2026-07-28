# Dependabot auto-merge policy

The workflow automatically approves and enables squash auto-merge for:

- GitHub Actions updates;
- npm semantic-version patch updates;
- npm semantic-version minor updates.

Major npm updates require manual review. All branch protection requirements and required checks continue to apply before GitHub performs the merge.

## Repository settings required

1. Enable **Settings → General → Pull Requests → Allow auto-merge**.
2. Under **Settings → Actions → General**, grant read/write workflow permissions and allow Actions to approve pull requests.
3. Protect `main` with required pull requests and required CI checks.
4. Retain squash merging as an allowed merge method.

The workflow uses `pull_request_target` only for metadata and GitHub CLI operations. It intentionally does not check out or execute code from the pull-request branch.
