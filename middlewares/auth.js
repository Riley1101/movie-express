function auth_middleware(req, res, next) {
  const publicUrls = ["/sign-in", "/sign-up"]
  if (!publicUrls.includes(req.originalUrl) && !req.session.user) {
    return res.redirect("/sign-in");
  }
  next();
}

module.exports = { auth_middleware };