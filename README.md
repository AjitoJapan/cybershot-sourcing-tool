# Cyber-shot T/TX Sourcing Tool

Sony Cyber-shot T/TX series sourcing decision tool for eBay cross-border sales.

## What it does

- Select a model and destination
- Enter purchase cost
- Compare rotation, middle, and margin-focused selling prices
- Calculate CPASS shipping cost
- Show break-even price
- Show BUY / caution / skip decisions
- Read market data from Supabase when configured

## Files

- `web-app/` - static browser app
- `supabase/schema.sql` - Supabase tables and seed data
- `apify-actor/` - Apify updater that refreshes market data twice monthly

## Supabase

The browser app uses only the publishable/anon key for read-only access.
Do not put a service role key in browser files.

## Apify updater

The Apify Actor lives in `apify-actor/`.

It collects low-frequency eBay sold-listing data for the T/TX model list and updates Supabase. The Supabase service role key must be stored only inside Apify, never in GitHub or Vercel.
