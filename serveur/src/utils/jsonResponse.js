

function jsonResponse(res, message, statusCode, data = null, success = true) {
  return res.status(statusCode).json({
    success,
    message,
    data,
  });
}

function successResponse(res, message, statusCode = 200, data = null) {
  return jsonResponse(res, message, statusCode, data, true);
}

function errorResponse(res, message, statusCode = 500, data = null) {
  return jsonResponse(res, message, statusCode,  data, false);
}

module.exports = {
  successResponse,
  errorResponse,
};
