import { validationResult } from "express-validator";

import { invalidResponse } from "../helpers/response.js";

const validator = (validations) => {
  return async (req, res, next) => {
    for (let validation of validations) {
      await validation.run(req);
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return invalidResponse(res, "Some fields are missing", errors.array(), "validator")
    }
    return next();
  };
};

export default validator;