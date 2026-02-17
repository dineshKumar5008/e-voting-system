import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";

export const applySecurityMiddlewares = (app) => {
  // Set various HTTP headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Can be fine-tuned per deployment
    })
  );

  // Prevent NoSQL injection
  app.use(mongoSanitize());

  // Prevent reflected XSS
  app.use(xss());

  // Prevent HTTP parameter pollution
  app.use(hpp());
};


