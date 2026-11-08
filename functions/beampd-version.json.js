import versionEndpoint from "../api/beampd-version.js";

export function onRequest({ request, env }) {
  return versionEndpoint.fetch(request, env);
}
