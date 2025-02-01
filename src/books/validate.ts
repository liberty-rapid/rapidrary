import Joi from 'joi';

const contentSchema = Joi.object({
    title: Joi.string().required(),
    file: Joi.string().min(3).max(255).required(),
    isPreview: Joi.boolean().optional().default(false),
    isNumbered: Joi.boolean().optional().default(true)
});

const bookMetaSchema = Joi.object({
    title: Joi.string().required(),
    contentDir: Joi.string().required(),
    description: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).required(),
    language: Joi.string().required(),
    coverImage: Joi.string().optional(),
    price: Joi.number().integer().min(0).required(),
    currency: Joi.string().length(3).required(),
    index: Joi.array().items(
        Joi.alternatives().conditional(Joi.string(), {
            then: Joi.string(),
            otherwise: contentSchema.keys({
                sections: Joi.array().items(contentSchema).optional()
            })
        })
    ).required(),
    hidden: Joi.boolean().optional(),
    pinned: Joi.boolean().optional()
});

export function validateBookMeta(data: unknown): Joi.ValidationResult {
    return bookMetaSchema.validate(data, { abortEarly: false });
}
