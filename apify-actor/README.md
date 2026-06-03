# Apify monthly updater

This folder is the starter shape for the monthly or twice-monthly eBay update job.

The web app already works with seeded data. The next production step is:

1. Pick or build an Apify Actor that collects eBay sold-listing data for the T/TX model list.
2. Store these secrets in Apify, never in the browser:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. After each run, upsert aggregated rows into `model_market_metrics`.

The Supabase REST endpoint is:

```text
https://<project_ref>.supabase.co/rest/v1/model_market_metrics
```

Use the service role key only inside Apify. The browser app uses only the anon key for reads.
