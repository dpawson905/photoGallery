const debug = require("debug")("e-photos:register");
const randomstring = require("randomstring");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// DB Model Files
const User = require("../../models/user");
const Token = require("../../models/tokens");

module.exports = {
  async getVerifyAccount(req, res, next) {
    let token = await Token.findOne({
      token: req.query.token
    });

    if (!token) {
      req.flash(
        "error",
        "Sorry that token is either invalid or has expired. Please enter your email address to get a new token."
      );
      res.redirect("/users/resend-token");
      return;
    }
    debug("validating user");

    let user = await User.findOne({ _id: token._userId });
    if (!user) {
      req.flash("error", err.message);
      res.redirect("back");
      return;
    }
    user.isVerified = true;
    user.expiresDateCheck = undefined;
    await user.save();
    req.flash("success", "Your account is now verified, you may now login.");
    res.redirect("/users/login");
  },

  getResendToken(req, res, next) {
    res.render("auth/resend-token");
  },

  async postResendToken(req, res, next) {
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
      req.flash(
        "error",
        "There is no user associated with this email account. Please try again."
      );
      res.redirect("back");
      return;
    }
    if (user.isVerified) {
      req.flash("error", "This account is already verified.");
      res.redirect("/");
      return;
    }
    /* 
      Generate a new token and save it to the tokens collection
    */
    const newToken = new Token({
      _userId: user._id,
      token: randomstring.generate(256)
    });
    await newToken.save();

    const msg = {
      to: user.email,
      from: "noreply@siteAuthTuts.site",
      subject: `${req.headers.host} - Validate your account`,
      text: `Hello ${user.username}, please copy and paste this link into
        your browser to verify your account. `,
      html: `Hi there ${user.username},
      <br>
      To reset your password please click the link to begin.
      <br>
      <a href="http://${req.headers.host}/users/validate?token=${
        newToken.token
      }">Verify Account</a>
      <br><br>
      Have a plesant day!`
    };
    sgMail.send(msg);
    req.flash("success", "Please check your email to confirm your account.");
    res.redirect("/");
  }
};
