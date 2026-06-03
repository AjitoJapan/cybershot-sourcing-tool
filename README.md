# Cyber-shot T/TX Sourcing Tool

Sony Cyber-shot T/TX series sourcing decision tool for eBay cross-border sales.

## What it does

- Select a model and destination
- Enter purchase cost
- Compare rotation, middle, and margin-focused selling prices
- Calculate CPASS shipping cost
- Show break-even price
- Show BUY / caution / skip decisions
- Read monthly sold-listing market data from Supabase when configured

## Files

- `web-app/` - static browser app
- `supabase/schema.sql` - Supabase tables and seed data
- `apify-actor/` - Apify updater that refreshes market data monthly

## Supabase

The browser app uses only the publishable/anon key for read-only access.
Do not put a service role key in browser files.

## Apify updater

The Apify Actor lives in `apify-actor/`.

It collects available eBay sold-listing data from the latest 90-day window for the T/TX model list and updates Supabase once per month. The Supabase service role key must be stored only inside Apify, never in GitHub or Vercel.
