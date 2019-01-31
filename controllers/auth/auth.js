const passport = require('passport');
const debug = require('debug')('e-photo:register');
const Joi = require('joi');
const randomstring = require('randomstring');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// DB Model Files
const User = require('../../models/user');
const Token = require("../../models/tokens");

module.exports = {
  getLogin(req, res, next) {
    res.render('auth/login');
  },

  async postLogin(req, res, next) {

    /*
      Find the user by the supplied username and see if it exists.
      Check to see if the user is verified, if not inform the user.
      Check to see if the password is expired, if so redirect to 
      the change password page.
    */

    const user = await User.findOne({
      email: req.body.email,
    });

    if (!user.isVerified) {
      req.flash('error', 'Your account is not verified. Please check your email to verify your account.');
      res.redirect('/users/resend-token');
      return;
    }

    let dateFormatted = new Date(user.passwordExp).getTime();
    if(Date.now() > dateFormatted) {
      const userToken = new Token({
        _userId: user._id,
        token: randomstring.generate(256)
      });
      await userToken.save();

      req.flash('error', 'Your password has expired. Please check your email and change it now.');
      res.redirect('/users/change-pw?token=' + userToken.token);
      return;
    }

    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/',
      failureFlash: true,
      successFlash: true
    })(req, res, next);
  },

  getLogout(req, res) {
    req.logout();
    res.redirect('/');
  }
}