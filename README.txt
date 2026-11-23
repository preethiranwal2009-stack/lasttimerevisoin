CHAPTER REVISION HELPER - public version

FILES
  index.html                       the website
  netlify/functions/generate.js    the small server part that talks to the AI
  netlify.toml                     settings

SETUP (one time)
1. Get an API key: console.anthropic.com -> sign up -> add a little credit -> API Keys -> Create key.
2. Put this folder on GitHub (new repository, upload all files, keep the folder structure).
3. On netlify.com: Add new site -> Import from Git -> choose that repository -> Deploy.
4. Netlify -> Site configuration -> Environment variables -> add:
     ANTHROPIC_API_KEY   = your key
     (optional) HOURLY_LIMIT = 10      questions per visitor per hour
     (optional) MODEL = claude-sonnet-5-5   better quality, costs more
5. Deploys -> Trigger deploy. Open your site and test with a PDF.

IMPORTANT
- Never put your API key inside index.html.
- Every use costs you a small amount. Set a monthly spending limit in the Anthropic console.
- Dragging a folder onto Netlify Drop will NOT run the server part. Use GitHub or the Netlify CLI.
