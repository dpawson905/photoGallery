const debug = require('debug')('e-photo:password');
const Joi = require('joi');
const randomstring = require('randomstring');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// DB Model Files
const User = require('../../models/user');
const Token = require('../../models/tokens');

// Validation Schema - forgot-pw
const forgotPwSchema = Joi.object().keys({
  email: Joi.string()
    .email({
      minDomainAtoms: 2
    })
    .required()
    .error(new Error('This is not a valid email address'))
});

// Validation Schema - change-pw
const changePwSchema = Joi.object().keys({
  token: Joi.string()
    .required(),
  password: Joi.string()
    .regex(/^[-@./#&+\w\s]{8,30}$/)
    .required()
    .error(
      new Error(
        'Password must be alphanumeric and only allows - @ . / # & + as special characters'
      )
    ),
  password2: Joi.any()
    .valid(Joi.ref('password'))
    .required()
    .error(
      new Error('Passwords must match')
    )
});

module.exports = {
  getForgotPw(req, res, next) {
    res.render('auth/forgot-pw');
  },

  async postForgotPw(req, res, next) {
    const result = await Joi.validate(req.body, forgotPwSchema);
    if (result.error) {
      req.flash('error', result.error.message);
      res.redirect('back');
      return;
    }

    let user = await User.findOne({
      'email': req.body.email
    });
    if (!user) {
      req.flash('error', 'There is no user associated with this email account. Please try again.');
      res.redirect('back');
      return;
    }
    if (user.isVerified) {
      req.flash('error', 'This account is already verified.');
      res.redirect('/');
      return;
    }
    debug('Generating new token - forgot-pw');
    const userToken = new Token({
      _userId: user._id,
      token: randomstring.generate(256)
    });
    await userToken.save();

    const msg = {
      to: user.email,
      from: 'noreply@siteAuthTuts.site',
      subject: `${req.headers.host} - Forgot Password`,
      text: `Hello ${user.username}, a request to reset you password has been made. If this was not you then you can ignore this message. `,
      html: `<p>Hi there ${user.username}</p>,
      <br>
      <p>A request to reset you password has been made. If this was not you then you can ignore this message.</p>
      <p>If this was you, then click the link below to get started.</p>
      <br>
      <a href="http://${req.headers.host}/users/change-pw?token=${userToken.token}">Change Password</a>
      <br><br>
      Have a plesant day!`,
    };
    sgMail.send(msg);
    req.flash('success', 'Please check your email to change your password.');
    res.redirect('/');
  },

  getChangePw(req, res, next) {
    res.render('auth/change-pw');
  },

  async postChangeExpPw(req, res, next) {
    const result = await Joi.validate(req.body, changePwSchema);
    if (result.error) {
      req.flash('error', result.error.message);
      res.redirect('back');
      return;
    }
    let token = await Token.findOne({
      token: req.body.token
    });
    let user = await User.findOne({
      _id: token._userId
    });
    if (!token) {
      req.flash('error', 'This token is invalid or has expired. Please type in your email to get a new token.');
      res.redirect('/users/forgot-pw');
      return;
    }
    debug('Changing user password');
    await user.setPassword(req.body.password, async (err) => {
      if (err) {
        req.flash('error', err.message);
        res.redirect('back');
        return;
      }
      user.passwordExp = Date.now() + 1.577e+10;
      user.attempts = 0;
      user.expiresDateCheck = undefined;
      await user.save();
      req.flash('success', 'Password has been changed.');
      res.redirect('/users/login');
    });
  },
}