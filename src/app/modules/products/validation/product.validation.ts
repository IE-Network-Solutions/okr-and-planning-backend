import * as Joi from 'joi';

export const createProductSchema = Joi.object().keys({
  name: Joi.string().required(),
  description: Joi.string().required(),
  pictureUrl: Joi.string().required(),
  category: Joi.string().required(),
  price: Joi.number().required(),
  userId: Joi.string(),
});

export const updateProductSchema = Joi.object({
  name: Joi.string(),

  description: Joi.string(),
  pictureUrl: Joi.string(),
  category: Joi.string(),
  price: Joi.number(),
}).min(1);
