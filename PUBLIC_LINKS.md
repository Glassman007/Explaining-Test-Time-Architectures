# Public Links - REQUIRED BEFORE SUBMISSION

## 1. Public artifact URL

`TODO: https://...`

Requirements:
- opens without sign-in;
- reaches the interactive artifact directly or with one obvious click;
- stable during judging;
- all lesson routes and assets load from a fresh/private browser session.

## 2. Public source-code repository

`TODO: https://github.com/<team>/<repo>`

A GitHub repository is **not the only acceptable host** unless the organizer explicitly says GitHub. The requirement is a **public source-code repository**. GitHub is simply the easiest/common choice; GitLab or another public Git host can also satisfy that wording.

## Recommended GitHub workflow

1. Create a new **Public** repository.
2. Unzip this submission package and upload/commit the repository files.
3. Add the final repository URL above and in `README.md`.
4. Choose a project license for team-authored code and add a `LICENSE` file.
5. Fix the missing lesson `index.html` files listed in `SUBMISSION_READINESS.md`.
6. Deploy the static site using GitHub Pages, Netlify, Vercel, Cloudflare Pages, or another public host.
7. Test the public URL in a signed-out/private browser window.

## GitHub Pages option

Because the project is static HTML/CSS/JS, GitHub Pages is a possible host once the missing lesson entry pages are restored. In the repository: **Settings -> Pages -> Deploy from a branch -> main / root** (UI wording can vary). The root `index.html` can then serve as the artifact entry point.
