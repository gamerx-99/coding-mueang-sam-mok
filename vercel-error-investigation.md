# Vercel Error Investigation

Checked the Vercel project `coding-mueang-sam-mok-he58` and its latest production deployment from commit `083e649b214e4af87056fa8dfb9095c549989a33`.

The deployment state is READY. Vercel runtime error clusters for the last 24 hours returned no errors, and runtime logs for the deployment returned no entries. The Vercel build completed successfully, but emitted warnings that `VITE_ANALYTICS_ENDPOINT` and `VITE_ANALYTICS_WEBSITE_ID` are not defined in `index.html`.

The default project domain `https://coding-mueang-sam-mok-he58.vercel.app/` responds HTTP 200 with `content-type: application/javascript` and a 49,747-byte body, rather than the expected HTML document. This indicates the current Vercel build/output routing is serving the bundled server entry (`dist/index.js`) at the root instead of serving `dist/public/index.html`.

The deployment-specific URL redirects HTTP 302 to Vercel SSO. Project protection is enabled with `ssoProtection.deploymentType = all_except_custom_domains`, so deployment URLs require Vercel authentication while custom domains are exempt. No custom domain is currently listed for this Vercel project.

No Vercel settings or application code were changed during this investigation.
