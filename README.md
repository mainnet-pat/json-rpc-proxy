# JSON-RPC proxy service

Allows to restrict the set of valid JSON-RPC methods to be called using the `ALLOWED_METHODS` environment variable. If set to `*` all methods are allowed. If set to a comma-separated list of values, only those whitelisted methods will be allowed. Example `ALLOWED_METHODS=getblock,getblockcount`.

Allows to override the authorization with the upstream JSON-RPC server and hide it from consumers using `AUTHORIZATION_HEADER_OVERRIDE` environment variable. Example `AUTHORIZATION_HEADER_OVERRIDE="Basic cnBjOnJwYw=="` uses the basic auth for user `rpc` and password `rpc`.

# Usage

Given the service was configured with following environment:

```
HOST=bchn.your.domain
PORT=443
ALLOWED_METHODS=getblock,getblockcount
AUTHORIZATION_HEADER_OVERRIDE="Basic cnBjOnJwYw=="
```

an example `curl` call to this proxy would be:

```
curl -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"1.0","id":"1","method":"getblockcount","params":[]}' localhost:8000
```
