
/**
 * @param {Object} res
 * @param {Error} error
 */
const handleError = (res, error) => {
  res.status(500).json({
    status: "error",
    error: error.message || "There's error",
  });
};

module.exports = handleError;
