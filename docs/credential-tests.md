# Credential-dependent validation

The project keeps six live credential checks separate from deterministic unit tests. They verify external service configuration without printing secret values. Run them only in a trusted environment with the variables listed below available to the process.

## Test matrix

| Test file | Variables | What it verifies | Provider setup required |
|---|---|---|---|
| `tests/appwrite.credentials.test.ts` — unauthenticated account request | `EXPO_PUBLIC_APPWRITE_ENDPOINT`, `EXPO_PUBLIC_APPWRITE_PROJECT_ID` | The configured Appwrite Cloud project is reachable and returns the expected unauthenticated response. | The endpoint and project ID must refer to the same Appwrite project. |
| `tests/appwrite.credentials.test.ts` — GitHub redirect | `EXPO_PUBLIC_APPWRITE_ENDPOINT`, `EXPO_PUBLIC_APPWRITE_PROJECT_ID` | Appwrite accepts the GitHub OAuth request and returns a redirect response without creating a client session. | Enable GitHub OAuth in Appwrite, add the project’s native callback scheme/platform, and keep the GitHub provider enabled. |
| `tests/appwrite.credentials.test.ts` — Google redirect | `EXPO_PUBLIC_APPWRITE_ENDPOINT`, `EXPO_PUBLIC_APPWRITE_PROJECT_ID` | Appwrite accepts the Google OAuth request and returns a redirect response without creating a client session. | Enable Google OAuth in Appwrite and register the native callback scheme/platform used by `app.config.ts`. |
| `tests/expo-token.credentials.test.ts` | `EXPO_TOKEN` | Expo GraphQL accepts the configured token for account access. | The token must belong to the Expo account that owns or can initialize the EAS project. Do not commit it. |
| `tests/github-write-token.credentials.test.ts` | `GITHUB_WRITE_TOKEN` | GitHub reports repository write permission for `SHARVANKUMARSINGH/alsi-ai`. | Use a current token with repository contents write permission, or use the connected GitHub integration. Do not place it in source control. |
| `tests/openrouter.credentials.test.ts` | `OPENROUTER_API_KEY` | The server process received an OpenRouter key with the expected key prefix. | Store the key as a server/runtime secret; never hard-code it in client code or tests. |

## Local configuration

Copy `.env.example` to `.env` and replace only the placeholder values locally. The custom loader in `scripts/load-env.js` reads `.env` for local commands while system-provided variables take precedence. The repository’s ignore rules must keep `.env` untracked.

```bash
cp .env.example .env
pnpm test
```

The ordinary test command includes the six live checks. To run deterministic tests without external credentials, exclude files whose names end in `.credentials.test.ts`:

```bash
pnpm vitest run --exclude 'tests/*.credentials.test.ts'
```

To run only the live checks after configuring the variables:

```bash
pnpm vitest run 'tests/*.credentials.test.ts'
```

The live checks do not authenticate a user, send an OTP, create a repository, start a build, or publish content. They perform reachability, permission, or configuration checks only. A missing-variable failure means the environment is incomplete; an HTTP failure should be investigated as provider configuration, token scope, project-platform registration, or temporary service availability.

## CI configuration

Add the same variable names as repository or environment secrets in the CI provider. Use secret storage rather than repository variables for `EXPO_TOKEN`, `GITHUB_WRITE_TOKEN`, and `OPENROUTER_API_KEY`. The Appwrite endpoint and project ID are identifiers rather than secrets, but keeping them in the same environment configuration makes the test invocation reproducible.

The OAuth redirect used by the native app is derived from the Appwrite project ID as `appwrite-callback-<project-id>://localhost`. The matching scheme is declared in `app.config.ts`, and `app/localhost.tsx` consumes Appwrite’s `userId` and `secret` query parameters before routing to `/(tabs)`.

## Troubleshooting the six failures

| Symptom | Likely cause | Safe check |
|---|---|---|
| Appwrite endpoint/project variables are undefined | `.env` was not created, variables were not injected, or the process was started outside the project root | Confirm variable names with `printenv` without printing values and rerun from the repository root. |
| Appwrite Google or GitHub request is rejected | Provider disabled, callback scheme not registered, or project ID does not match the endpoint | Verify provider toggles and native platform/callback settings in the Appwrite console. |
| Expo credential test reports an unauthorized response | Token is expired, belongs to another account, or lacks access to the EAS project | Verify account ownership and token scope in Expo; do not paste the token into source files. |
| GitHub write test reports insufficient permission | Token is read-only, expired, or the repository belongs to a different account | Verify repository access through the connected GitHub account or replace the secret in CI storage. |
| OpenRouter credential test reports a missing or malformed key | Server environment did not receive the key or a non-OpenRouter value was supplied | Configure `OPENROUTER_API_KEY` in the server environment and rerun the test. |

