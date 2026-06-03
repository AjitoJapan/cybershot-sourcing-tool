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
- `apify-actor/` - notes for the future Apify updater

## Supabase

The browser app uses only the publishable/anon key for read-only access.
Do not put a service role key in browser files.
