import * as http from "https://deno.land/std@0.103.0/http/mod.ts";
import * as path from "https://deno.land/std@0.103.0/path/mod.ts";
import * as sucrase from "https://jspm.dev/sucrase@3.20.0";

const server = http.serve({ port: 8080 });

const publicPath = path.resolve(path.dirname(path.fromFileUrl(import.meta.url)), "../public");

for await (const req of server) {
  let path = req.url;

  // Protect against directory traversal attacks
  if (path.includes("..")) { req.respond({ status: 400 }); continue; }

  // Serve index by default
  if (path === "/") path = "/index.html";

  let body;
  try { body = Deno.readTextFileSync(publicPath + path); }
  catch { req.respond({ status: 404, body: "Not found." }); continue; }

  // Use Sucrase to remove type annotations on the fly to turn TypeScript into JavaScript
  if (path.endsWith(".ts")) {
    body = sucrase.transform(body, { transforms: ["typescript"] }).code;
  }

  let contentType = "";
  if (path.endsWith(".html")) contentType = "text/html";
  else if (path.endsWith(".js")) contentType = "text/javascript";
  else if (path.endsWith(".ts")) contentType = "text/javascript";
  // TODO: Add more media types for each extension as needed

  req.respond({ headers: new Headers({ "content-type": contentType }), body: body });
}
