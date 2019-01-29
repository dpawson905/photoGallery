const express = require('express');
const router = express.Router();
const passport = require('passport');


const {
  getRegister,
  postRegister,
  getRegisterFB
} = require('../controllers/auth/register');
const {
  getVerifyAccount,
  getResendToken,
  postResendToken
} = require('../controllers/auth/validate');
const {
  getLogin,
  postLogin,
  getLogout
} = require('../controllers/auth/auth');
const {
  getForgotPw,
  postForgotPw,
  getChangePw,
  postChangeExpPw
} = require('../controllers/auth/password');

const {
  asyncErrorHandler,
  isAuthenticated,
  isNotAuthenticated,
  isValidated,
  isRegistered
} = require('../middleware/index');

/* GET user register. */
router.get('/register', asyncErrorHandler(isRegistered), getRegister);

/* POST user register */
router.post('/register', asyncErrorHandler(postRegister));

/* GET validate account */
router.get('/validate', asyncErrorHandler(getVerifyAccount));

/* GET user login. */
router.get('/login', getLogin);

/* POST user login */
router.post('/login', asyncErrorHandler(postLogin));

/* GET resend token */
router.get('/resend-token', getResendToken);

/* POST resend token */
router.post('/resend-token', asyncErrorHandler(postResendToken));

/* GET forgot-pw */
router.get('/forgot-pw', getForgotPw);

/* POST forgot-pw */
router.post('/forgot-pw', asyncErrorHandler(postForgotPw));

/* GET change-pw */
router.get('/change-pw', getChangePw);

/* POST change-pw */
router.post('/change-pw', asyncErrorHandler(postChangeExpPw));

/* GET logout */
router.get('/logout', getLogout);

module.exports = router;