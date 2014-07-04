/**
 * GET /
 * Home page.
 */

exports.index = function(req, res) {
  res.render('index', {
    title: 'devInbox - helping developers share their project',
    description: 'DevInbox connects developers, hackers, and makers of things'
  });
};
