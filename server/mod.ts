import * as http from "https://deno.land/std@0.103.0/http/mod.ts";
import * as path from "https://deno.land/std@0.103.0/path/mod.ts";
import * as sucrase from "https://jspm.dev/sucrase@3.20.0";

const publicPath = path.resolve(path.dirname(path.fromFileUrl(import.meta.url)), "../public");
const textDecoder = new TextDecoder();

const server = http.serve({ port: 8080 });

for await (const req of server) handleReq(req);

async function handleReq(req: http.ServerRequest) {
  let relPath = req.url;

  // Protect against directory traversal attacks
  if (relPath.includes("..")) { return await req.respond({ status: 400 }); }

  // Serve index by default
  if (relPath === "/") relPath = "/index.html";

  let body: Deno.Reader | string;
  try { body = await Deno.open(publicPath + relPath); }
  catch { return await req.respond({ status: 404, body: "Not found." }); }

  if (relPath.endsWith(".ts")) {
    // Use Sucrase to remove type annotations on the fly to turn TypeScript into JavaScript
    const tsCode = textDecoder.decode(await Deno.readAll(body));
    body = sucrase.transform(tsCode, { transforms: ["typescript"] }).code;
  }

  let contentType = "";
  if (relPath.endsWith(".html")) contentType = "text/html";
  else if (relPath.endsWith(".js")) contentType = "text/javascript";
  else if (relPath.endsWith(".ts")) contentType = "text/javascript";
  // TODO: Add more media types for each extension as needed

  return await req.respond({ headers: new Headers({ "content-type": contentType }), body: body });
}
