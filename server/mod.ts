import * as fs from "jsr:@std/fs";
import * as path from "jsr:@std/path";
import * as sucrase from "https://esm.sh/sucrase@3.35.0";

const utf8Encoder = new TextEncoder();

Deno.serve({ port: 8080 }, handleReq);

async function handleReq(req: Request) {
  switch (req.method) {
    case "GET": return await handleStaticReq(req);
    default: return new Response(null, { status: 404 });
  }
}

async function handleStaticReq(req: Request) {
  let pathname = new URL(req.url).pathname;
  if (pathname.endsWith("/")) pathname += "index.html";
  else if (!pathname.includes(".")) {
    const localUrl = new URL(path.join("../public", pathname, "/index.html"), import.meta.url);
    if (await fs.exists(localUrl)) return Response.redirect(new URL(req.url + "/"));
  }

  const localUrl = new URL(path.join("../public", pathname), import.meta.url);

  let body: ReadableStream<Uint8Array> | Uint8Array;
  if (pathname.endsWith(".ts")) {
    let code;
    try { code = sucrase.transform(await Deno.readTextFile(localUrl), { disableESTransforms: true, transforms: ["typescript"], filePath: pathname }).code; }
    catch (err) {
      if (err instanceof Deno.errors.NotFound) return new Response(null, { status: 404 });
      return new Response("Failed to transpile TypeScript", { status: 500 });
    }
    body = utf8Encoder.encode(code);
  } else {
    try { body = (await Deno.open(localUrl)).readable; }
    catch { return new Response(null, { status: 404 }); }
  }

  return new Response(body, { headers: new Headers({ "Content-Type": getContentType(pathname) }) });
}

function getContentType(pathname: string) {
  if (pathname.endsWith(".html")) return "text/html; charset=utf-8";
  else if (pathname.endsWith(".css")) return "text/css; charset=utf-8";
  else if (pathname.endsWith(".ts")) return "text/javascript; charset=utf-8";
  else if (pathname.endsWith(".js")) return "text/javascript; charset=utf-8";
  else if (pathname.endsWith(".json")) return "application/json; charset=utf-8";
  else if (pathname.endsWith(".webmanifest")) return "application/manifest+json; charset=utf-8";
  else if (pathname.endsWith(".png")) return "image/png";
  else if (pathname.endsWith(".jpg")) return "image/jpeg";
  else if (pathname.endsWith(".svg")) return "image/svg+xml";
  else if (pathname.endsWith(".ico")) return "image/x-icon";
  else if (pathname.endsWith(".txt")) return "text/plain";

  return "application/octet-stream";
}
