import { SendError } from "../services/errorHandeler.js";

export const validate = (schema, target = 'body') => {
  return (req, res, next) => {
    const data = target === 'query' ? req.query : req.body;
    
    const { error } = schema.validate(data, { abortEarly: false });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      throw new SendError(400, errors.join(', '));
    }

    next();
  };
};