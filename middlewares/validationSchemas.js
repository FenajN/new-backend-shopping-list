const Joi = require("joi");

const createListSchema = Joi.object({
  name: Joi.string().min(1).required(),
  ownerId: Joi.string().required(),
  members: Joi.array()
    .items(
      Joi.alternatives().try(
        Joi.string(),
        Joi.object({
          userId: Joi.string().required(),
          role: Joi.string().valid("Owner", "Member").required(),
        })
      )
    )
    .required(),
  items: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        isCompleted: Joi.boolean().required(),
      })
    )
    .optional(),
  isArchived: Joi.boolean().optional(),
});


const updateListSchema = Joi.object({
  name: Joi.string().min(1).optional(),
  members: Joi.array()
    .items(
      Joi.object({
        userId: Joi.string().required(),
        role: Joi.string().valid("Owner", "Member").required(),
      })
    )
    .optional(),
  items: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        isCompleted: Joi.boolean().required(),
      })
    )
    .optional(),
  isArchived: Joi.boolean().optional(),
});

const updateItemsSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().min(1).required(),
        isCompleted: Joi.boolean().required(),
      })
    )
    .required(),
});


const addMemberSchema = Joi.object({
  memberId: Joi.string().required(),
});

const removeMemberSchema = Joi.object({
  memberId: Joi.string().required(),
});

const registerUserSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginUserSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const searchSchema = Joi.object({
  search: Joi.string()
    .min(1)
    .required()
    .messages({
      'string.empty': 'Search query cannot be empty',
      'any.required': 'Search query is required',
    }),
}).unknown(true);



const googleLoginSchema = Joi.object({
  token: Joi.string().required().messages({
    "string.empty": "Google token is required",
    "any.required": "Google token is required",
  }),
});
/*
const searchAllListsSchema = Joi.object({
  limit: Joi.string().required(Number)
})
*/
module.exports = {
  registerUserSchema,
  loginUserSchema,
  searchSchema,
  createListSchema,
  updateListSchema,
  addMemberSchema,
  updateItemsSchema,
  removeMemberSchema,
  googleLoginSchema
};


