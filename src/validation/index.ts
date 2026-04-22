import { body, validationResult } from "express-validator";
import { NextFunction, Request, Response } from "express";

export const loginValidation = () => {
  return [
    body("email")
      .isEmail()
      .withMessage("Email is not a valid email")
      .trim()
      .escape(),
    body("password")
      .isLength({ min: 6 })
      .trim()
      .escape()
      .withMessage("Must be at least 6 chars long"),
  ];
};

export const signUpValidation = () => {
  return [
    body("username")
      .isLength({ min: 6 })
      .withMessage("Username must be at least 6 chars long")
      .trim()
      .escape(),
    body("fullName")
      .isLength({ min: 2 })
      .withMessage("Full name is required")
      .trim()
      .escape(),
    body("numTel")
      .isLength({ min: 6 })
      .withMessage("Phone number must be at least 6 chars long")
      .trim()
      .escape(),
    body("email")
      .isEmail()
      .withMessage("Email is not a valid email")
      .trim()
      .escape(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 chars long")
      .trim()
      .escape(),
  ];
};

export const updateProfileValidation = () => {
  return [
    body("username")
      .isLength({ min: 6 })
      .withMessage("Username must be at least 6 chars long")
      .trim()
      .escape(),
    body("fullName")
      .optional()
      .isLength({ min: 2 })
      .trim()
      .escape(),
    body("numTel")
      .optional()
      .isLength({ min: 6 })
      .trim()
      .escape(),
    body("email")
      .isEmail()
      .withMessage("Email is not a valid email")
      .trim()
      .escape(),
  ];
};

export const changePasswordValidation = () => {
  return [
    body("oldPassword")
      .isLength({ min: 6 })
      .withMessage("Old Password must be at least 6 chars long")
      .trim()
      .escape(),
    body("newPassword")
      .isLength({ min: 6 })
      .trim()
      .escape()
      .withMessage("New Password must be at least 6 chars long"),
    body("confirmNewPassword")
      .isLength({ min: 6 })
      .trim()
      .escape()
      .withMessage("Confirm New Password must be at least 6 chars long"),
  ];
};

export const productValidation = () => {
  return [
    body("name")
      .trim()
      .isLength({ min: 6 })
      .withMessage("Name must be at least 6 chars long")
      .escape(),
    // Do not use .escape() on price or category — it mangles numbers and ObjectIds
    body("price")
      .trim()
      .isFloat({ gt: 0 })
      .withMessage("Price must be a positive number"),
    body("description")
      .trim()
      .isLength({ min: 6, max: 400 })
      .withMessage("Description must be between 6 and 400 characters")
      .escape(),
    body("category")
      .trim()
      .isMongoId()
      .withMessage("Category must be a valid MongoDB id"),
  ];
};

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors: Object[] = [];
  errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));

  return res.status(422).json({
    message: "The given data was invalid",
    errors: extractedErrors,
  });
};
