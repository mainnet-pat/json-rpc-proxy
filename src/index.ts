import express from "express";
import cors from "cors";
import https from "https";
import http from "http";

const app = express();
app.use(express.json({limit: '10mb'}));
app.use(cors());
app.use(express.json());

const port = Number(process.env.PORT || 443);
const proto = port === 443 ? https : http;
const allowAll = process.env.ALLOWED_METHODS === "*";
const allowedMethods = process.env.ALLOWED_METHODS ? process.env.ALLOWED_METHODS?.split(",") : [];
if (!allowAll && !allowedMethods.length) {
  console.error("No allowed json rpc methods provided, specify \"*\" to allow all methods or a comma-separated list of methods in the ALLOWED_METHODS environment variable.");
  process.exit(1);
}

app.post("*", (req: any, res) => {
  if (!req.body?.method) {
    res.status(200).send({
      id: null,
      error: {"code": -1, "message": "Wrong post body"},
      result: null,
    })
  }

  if (!allowAll) {
    if (!allowedMethods.includes(req.body.method)) {
      res.status(200).send({
        id: req.body.id,
        error: {"code": -90, "message": "Method disabled"},
        result: null,
      })

      return;
    }
  }

  const authorizationHeader = process.env.AUTHORIZATION_HEADER_OVERRIDE || req.headers.authorization;

  const connector = proto.request({
    port: port,
    host: process.env.HOST,
    path: req.url,
    method: req.method,
    headers: {
      "host": process.env.HOST,
      "content-length": req.headers["content-length"],
      ...(authorizationHeader ? {"authorization": authorizationHeader} : {}),
    } as any,
  }, (resp: any) => {
    resp.pipe(res);
  });

  connector.write(JSON.stringify(req.body));
  connector.end();

  return req.pipe(connector);
});

console.log("Service started at 'localhost:8000' with allowed methods: ", allowedMethods);
app.listen(8000);
