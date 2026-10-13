/**
 * ============================================================
 * CUSTOM MONGO SANITIZER (Express 5 Compatible)
 * ============================================================
 *
 * Replaces express-mongo-sanitize which is incompatible with
 * Express 5's read-only req.query property.
 *
 * Strips keys starting with $ or containing . from:
 *   - req.body
 *   - req.params
 *   - req.query
 * ============================================================
 */

const sanitizeValue = (value) => {
  if (value === null || value === undefined) return value;

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (typeof value === "object") {
    const cleaned = {};
    for (const key of Object.keys(value)) {
      if (key.startsWith("$") || key.includes(".")) continue;
      cleaned[key] = sanitizeValue(value[key]);
    }
    return cleaned;
  }

  return value;
};

export const sanitizeMongo = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body);
  }

  if (req.params && typeof req.params === "object") {
    const original = { ...req.params };
    for (const key of Object.keys(original)) {
      if (key.startsWith("$") || key.includes(".")) {
        try {
          delete req.params[key];
        } catch {}
      } else {
        try {
          req.params[key] = sanitizeValue(original[key]);
        } catch {}
      }
    }
  }

  if (req.query && typeof req.query === "object") {
    const original = { ...req.query };
    for (const key of Object.keys(original)) {
      if (key.startsWith("$") || key.includes(".")) {
        try {
          delete req.query[key];
        } catch {}
      }
    }
  }

  next();
};
