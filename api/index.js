import app from "../src/index";

// This is a Vercel-specific handler that exports your Express app
module.exports = (req, res) => {
  // This line is critical - it tells Express to handle the request
  return app(req, res);
};
