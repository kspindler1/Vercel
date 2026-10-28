# Kloud Vercel Deployment

This folder is a self-contained Vercel project. Import the repository and set the Vercel project Root Directory to `vercel-deploy`.

## Environment variables

Set credentials in Vercel Project Settings > Environment Variables. Do not commit `.env.local` or put keys in frontend files.

- `AI_PROVIDERS`: `apollo,gemini` to try Apollo first, then Gemini
- `APOLLO_CLIENT_ID` and `APOLLO_CLIENT_SECRET`: required for Apollo
- `APOLLO_MODEL`: optional; defaults in the provider code
- `GEMINI_API_KEY`: required for Gemini fallback
- `GEMINI_MODEL`: optional; defaults in the provider code
- `OPENAI_API_KEY`: optional existing OpenAI key; add `openai` to `AI_PROVIDERS` to enable it

The Exercises page contains Advanced Agent Troubleshooting and Spot the AI Opportunity. Prompt Image Studio and its image-generation API have been removed.

Apollo requires the Vercel runtime to have network access to the organization's internal Apollo gateway. Configure credentials and models only if approved for the project.

## Deploy

1. Import the repository into Vercel.
2. Set Root Directory to `vercel-deploy`.
3. Keep the build command empty; Vercel serves `public/` and deploys the `api/` functions.
4. Add the environment variables above for the intended deployment environments.
5. Deploy, then verify `/api/health` and test the configured text-generation route.

Local `vercel dev` requires Node.js 20+ and the Vercel CLI. This workspace excludes env files from Git.

The static Python preview on port 4173 serves files only. For API-backed features, run `npm run dev` from `vercel-deploy` and configure the required text-provider credentials in an untracked `.env.local`. On Vercel, set the same variables in Project Settings and redeploy after changing them.
