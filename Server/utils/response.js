export const sendSuccess = (res, data = null, message = null, statusCode = 200) => {
  const response = { success: true };
  if (data !== null) response.data = data;
  if (message !== null) response.message = message;
  return res.status(statusCode).json(response);
};

export const sendError = (res, message = 'An error occurred', code = null, statusCode = 400) => {
  const errorObj = { message };
  if (code) errorObj.code = code;
  return res.status(statusCode).json({
    success: false,
    error: errorObj
  });
};
