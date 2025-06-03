const app = require("../index").default;

export default function handler(req: any, res: any) {
  return app(req, res);
}