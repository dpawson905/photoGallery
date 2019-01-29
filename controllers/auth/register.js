const debug = require('debug')('se-photo:register');
const randomstring = require('randomstring');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// DB Model Files
const User = require('../../models/user');
const Token = require('../../models/tokens');

module.exports = {
  async getRegister(req, res, next) {
    res.render('auth/register');
  },

  async postRegister(req, res, next) {
    /* 
      Check if email and or username is already taken
      If so, redirect back to the registration page and inform the user
    */
    const userEmail = await User.findOne({
      email: req.body.email
    });

    if (userEmail) {
      req.flash('error', 'This email address is already in use.');
      res.redirect('back');
      return;
    }

    const userName = await User.findOne({
      username: req.body.username
    });

    if (userName) {
      req.flash('error', 'This username is already in use.');
      res.redirect('back');
      return;
    }

    debug('Registering user');

    /* 
      Create our new user object.
    */
    let userImage;
    let uploadImage = req.files.image;
    if (Object.keys(req.files).length == 0) {
      userImage = `https://robohash.org/${randomstring.generate(6)}?set=set3`;
    } else {
      userImage = `${randomstring.generate(9)}_${req.files.image.name}`;
      await uploadImage.mv(`./public/uploads/${userImage}`, async (err) => {
        if (err) {
          debug(err);
          return res.redirect('back');
        }
        const newUser = await new User({
          name: req.body.name,
          email: req.body.email,
          username: req.body.username,
          image: `/uploads/${userImage}`,
          passwordExp: Date.now() + 1.577e+10,
          expiresDateCheck: Date.now()
        });

        /* 
          Look to see if user database is empty. If so make first user admin.
        */
        const admin = await User.find({});
        if (admin.length < 1) {
          newUser.isAdmin = true;
        }
        
        if (admin.length) {
          req.flash('error', 'Sorry, registration is disabled at this time.');
          return res.redirect('back');
        }

        /* 
          Delete the confirmation password as it is not needed in the user collection.
        */
        delete req.body.confirmationPassword;

        /* 
          Register the user and encrypt the password
        */
        await User.register(newUser, req.body.password);

        /* 
          Find the temp user by the username submitted on the form
        */
        const user = await User.findOne({
          username: req.body.username
        });
        /* 
          Generate secret token for email authentication
          Save that token in the token collection and link
          it to the temp user.
        */
        const userToken = new Token({
          _userId: user._id,
          token: randomstring.generate(256)
        });
        await userToken.save();

        /* 
          Send the registered user an email to verify their account.
        */
        const msg = {
          to: newUser.email,
          from: 'noreply@siteAuthTuts.site',
          subject: 'Account Verification',
          text: `Hello ${newUser.username}, please copy and paste this link into
            your browser to verify your account. http://${req.headers.host}/users/validate?token=${userToken.token}`,
          html: `Hi there ${newUser.username},
          <br>
          To activate your account please click the link below.
          <br>
          <a href="http://${req.headers.host}/users/validate?token=${userToken.token}">Verify Account</a>
          <br><br>
          Have a plesant day!`,
        };
        sgMail.send(msg);
        req.flash('success', 'Please check your email to confirm your account.');
        res.redirect('/');
      })
    }
  }
}