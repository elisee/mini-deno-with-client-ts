# Minimal Deno with client-side TypeScript

This is a minimal [Deno 2](https://deno.land) server example that lets you use TypeScript for client-side code too.

No bundling or extra compilation required, TypeScript files are transpiled to JavaScript on-the-fly using [Sucrase](https://sucrase.io).

In production, you'll want to do some caching to avoid reloading the files from disk for each request. You can either add a simple map that keeps the bytes in memory for each URL once they've been loaded once, or put your app behind some kind of proxy server like Cloudflare.

## Running the server

    deno -A server/mod.ts
