var _ = require('lodash');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var User = require('../models/user');
var Project = require('../models/project');
var secrets = require('../config/secrets');


/**
 * GET /share
 * gh
 */
exports.getShare = function(req, res) {
  res.render('email', {
    title: 'devInbox - share a new projects',
    description: 'devInbox - share a new projects'
  });
};


/**
 * Post /share
 * Send share project link to inbox 
 */
exports.postShare = function(req, res, next) {
  req.assert('email', 'Email is not valid').isEmail();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/share');
  }

  async.waterfall([
    function(done) {
      crypto.randomBytes(16, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({email: req.body.email}, function(err, user) {
        if (!user) {
          user = new User();
          user.email = req.body.email;
          user.name = req.body.email.substring(0, req.body.email.indexOf('@'));
        }

        user.postToken = token;
        user.postTokenExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport('SMTP', {
        service: 'Gmail',
        auth: {
          user: secrets.Gmail.user,
          pass: secrets.Gmail.password
        }
      });

      var mailOptions = {
        to: user.email,
        from: secrets.Gmail.user,
        subject: 'devInbox - Post a new new project',
        text: 'Please use on the following link to share your new project:\n\n' +
          'http://' + req.headers.host + '/share/' + token + '\n\n' +
          'If you did not request this, please ignore this email.\n\n\n' + 
          'DevInbox Team'
      };

      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('info', { msg: 'An link has been sent to ' + user.email + '. Use it to share your project.' });
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/share');
  });
};


/**
 * GET /share/:token
 * gh
 */
exports.getShareToken = function(req, res) {
  var token  = req.params.token;
  var categories = [
    {name: 'Library'},
    {name: 'Framework'},
    {name: 'Web App'},
    {name: 'Mobile App'},
    {name: 'Software'},
    {name: 'Boilerplate'},
    {name: 'Productivity'}
  ];

  User.findOne({postToken: token})
    .where('postTokenExpires').gt(Date.now())
    .exec(function(err, user) {
      if (!user) {
        req.flash('errors', { msg: 'Token is invalid or has expired.' });
        return res.redirect('/share');
      }

      res.render('share', {
        title: 'devInbox - share a new projects',
        description: 'devInbox - share a new projects',
        token: token,
        categories: categories
      });
    });
};

/**
 * POST /subscribe
 * Add new subscriber.
 * @param email
 * @param name
 */
exports.postSubscribe = function(req, res, next) {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('name', 'Name must be at least 3 characters long').len(3);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/');
  }

  var user = new User({
    email: req.body.email,
    name: req.body.name
  });

  User.findOne({ email: req.body.email }, function(err, existingUser) {
    if (existingUser) {
      req.flash('errors', { msg: 'That email address already exists in our database.' });
      return res.redirect('/');
    }
    user.save(function(err) {
      if (err) {
        req.flash('errors', { msg: 'Database error, subscription failed' });
        res.redirect('/');
      }

      req.flash('success', { msg: 'Subscription successful' });

      res.redirect('/');

      // activated once functionality has been implemented
      //res.redirect('/preferences');
    });
  });
};


/**
 * POST /reset/:token
 * Process the reset password request.
 * @param token
 */

exports.postProject = function(req, res, next) {
  req.assert('title', 'Title must be at least 3 characters long').len(3);
  req.assert('category', 'Category must be selected').notEmpty();
  req.assert('title', 'Title must be at least 3 characters long').len(3);
  req.assert('short_desc', 'Short description must be at least 12 characters and not exceed 100 characters').len(12, 100);
  req.assert('desc', 'Description must be at least 32 characters long').len(32);
  req.assert('tags', 'Technogies must not be empty').notEmpty();
  req.assert('url', 'Project Url must not be empty').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  var projectData = {
    title: req.body.title,
    category: req.body.category,
    short_desc: req.body.short_desc,
    desc: req.body.desc,
    tags: req.body.tags.split(',').map(function(tag){ return tag.trim();}),
    url: req.body.url,
    code_url: req.body.code_url
  };

  var project;

  async.waterfall([
    function(done) {
      User
        .findOne({ postToken: req.params.token })
        .where('postTokenExpires').gt(Date.now())
        .exec(function(err, user) {
          if (!user) {
            req.flash('errors', { msg: 'Project post token is invalid or has expired.' });
            return res.redirect('back');
          }

          user.twitter = req.body.author_twitter;
          user.github = req.body.author_github;
          user.website = req.body.author_website;
          user.postToken = undefined;
          user.postTokenExpires = undefined;

          projectData.userId = user._id;
          project = new Project(projectData);

          project.save(function () {
            if (err) return next(err);

            user.save(function(err) {
              if (err) return next(err);
              done(err, user);
            });
  
          });
        });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport('SMTP', {
        service: 'Gmail',
        auth: {
          user: secrets.Gmail.user,
          pass: secrets.Gmail.password
        }
      });

      var mailOptions = {
        to: user.email,
        from: secrets.Gmail.user,
        subject: 'devInbox - You have shared a new project',
        text: 'Hi ' + user.name + ', \n\n' +
          'You have successfully shared a new project titled "' + project.title +'", responses will be sent to your inbox.\n\n\n' +
          'DevInbox Team'
      };

      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('info', { msg: 'Your project has been successfully shared.' });
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/');
  });
};
