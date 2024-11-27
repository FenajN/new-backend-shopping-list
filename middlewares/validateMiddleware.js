const validateMiddleware = (schema, source = 'body') => (req, res, next) => {
  try {
    const data = source === 'query' ? req.query : req.body;
    const { error } = schema.validate(data, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        error: error.details.map((detail) => detail.message),
      });
    }
    next();
  } catch (error) {
    console.error("Validation middleware error:", error.message);
    res.status(500).json({ error: "Validation error" });
  }
};

module.exports = validateMiddleware;



