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
const allowedMethods = process.env.ALLOWED_METHODS ? process.env.ALLOWED_METHODS.split(",") : [];
if (!allowedMethods.length) {
  console.error("No allowed methods provided");
  process.exit(1);
}

app.post("*", (req: any, res) => {
  if (!allowedMethods.includes(req.body.method)) {
    res.status(200).send({
      id: req.body.id,
      error: {"code": -90, "message": "Method disabled"},
      result: null,
    })
  }

  const connector = proto.request({
    port: port,
    host: process.env.HOST,
    path: req.url,
    method: req.method,
    headers: {
      "authorization": req.headers.authorization,
      "host": process.env.HOST,
      "content-length": req.headers["content-length"],
    } as any,
  }, (resp: any) => {
    resp.pipe(res);
  });

  connector.write(JSON.stringify(req.body));
  connector.end();

  return req.pipe(connector);
});

console.log("Service started with allowed methods: ", allowedMethods);
app.listen(8000);
