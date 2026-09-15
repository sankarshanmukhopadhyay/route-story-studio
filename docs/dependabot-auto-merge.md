# Dependabot auto-merge policy

The workflow automatically approves and enables squash auto-merge only for semantic-version **patch** and **minor** updates proposed by Dependabot. The same bound applies to npm dependencies and GitHub Actions.

Semantic-version **major** updates require explicit human review, regardless of package ecosystem. This keeps dependency automation useful without delegating acceptance of potentially breaking dependency or workflow-action changes. All branch protection requirements and required checks continue to apply before GitHub performs an eligible merge.

## Authority boundary

Dependabot is authorized to propose dependency changes. For patch and minor updates, the repository additionally authorizes the automation workflow to approve the proposal and enable auto-merge after required checks pass. Major updates remain outside that delegated acceptance scope and require a human decision.

The repository's `npm run security-check` validation verifies that the workflow retains the Dependabot actor restriction, does not check out pull-request code, requires minor/patch update metadata at both approval and merge gates, and does not restore an unconditional GitHub Actions bypass.

## Repository settings required

1. Enable **Settings → General → Pull Requests → Allow auto-merge**.
2. Under **Settings → Actions → General**, grant read/write workflow permissions and allow Actions to approve pull requests.
3. Protect `main` with required pull requests and required CI checks.
4. Retain squash merging as an allowed merge method.

The workflow uses `pull_request_target` only for Dependabot metadata and GitHub CLI operations. It intentionally does not check out or execute code from the pull-request branch.
