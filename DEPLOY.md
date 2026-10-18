# Deploy Crownfall on Render

**Online expansion:** the existing Static Site now connects to a separate Node web service for 2–4 player rooms. See [MULTIPLAYER.md](MULTIPLAYER.md). `render.yaml` describes both resources. The web service runs `node server.cjs` after `node build.cjs`; its health endpoint is `/health`. `online-config.js` contains the public battle-service URL, not a secret.

This browser game deploys as a Render **Static Site**. No backend, database, environment variables, or start command is required.

1. Push this project, including `assets/art/*.png` and `render.yaml`, to a GitHub or GitLab repository.
2. In Render, choose **New → Blueprint**, connect the repository, and select its branch.
3. Render reads `render.yaml`; create the `crownfall` static site.
4. Wait for the deployment to finish and open the assigned `https://<site-name>.onrender.com` address. The exact URL is assigned by Render.

For manual **New → Static Site** setup, use:

| Setting | Value |
|---|---|
| Root directory | Leave blank when these files are at the repository root |
| Build command | `node build.cjs` |
| Publish directory | `dist` |

Run `node build.cjs` locally to verify packaging. It copies the HTML, referenced scripts/styles, and PNG artwork, excluding test scripts and project notes. Run `node verify.cjs` and `node verify-strategy.cjs` before publishing gameplay changes.

After deployment, check champion selection, both maps, movement, skills, construction, the merchant shop, artwork, and sound after clicking. Future deployments follow the linked branch's Render deployment settings.

Render's Blueprint documentation: https://render.com/docs/blueprint-spec
