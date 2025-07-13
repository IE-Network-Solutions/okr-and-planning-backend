import { PipeTransform, BadRequestException } from '@nestjs/common';
import Joi from 'joi';

export class ValidatorPipe<Dto> implements PipeTransform<Dto> {
  constructor(private schema: Joi.ObjectSchema<any>) {}
  public transform(value: Dto): Dto {
    const result = this.schema.validate(value);
    if (result.error) {
      const errorMessages = result.error.details
        .map((d) => {
          let message = d.message;
          if (message.includes('"value" is required')) {
            message = 'This field is required.';
          } else if (message.includes('"value" must be a string')) {
            message = 'Please enter text in this field.';
          } else if (message.includes('"value" must be a number')) {
            message = 'Please enter a valid number.';
          } else if (message.includes('"value" must be a valid email')) {
            message = 'Please enter a valid email address.';
          } else if (message.includes('"value" must be a valid date')) {
            message = 'Please enter a valid date.';
          } else if (message.includes('"value" must be a valid uuid')) {
            message = 'Please provide a valid identifier.';
          } else if (message.includes('"value" must be less than')) {
            message = 'The value is too high. Please enter a smaller number.';
          } else if (message.includes('"value" must be greater than')) {
            message = 'The value is too low. Please enter a larger number.';
          } else if (message.includes('"value" length must be')) {
            message =
              'The text length is not correct. Please check the requirements.';
          } else if (message.includes('"value" must be one of')) {
            message = 'Please select a valid option from the list.';
          } else {
            message = message.replace(/"/g, '').replace(/\\/g, '');
            message = message.charAt(0).toUpperCase() + message.slice(1);
          }
          return message;
        })
        .join('. ');
      throw new BadRequestException(errorMessages);
    }
    return value;
  }
}
