/**
 * GET /
 * Home page.
 */

exports.index = function(req, res) {
  res.render('index', {
    title: 'DevInbox - helping developers share their project',
    description: 'DevInbox connects developers, hackers, and makers of things'
  });
};


exports.test = function(req, res) {
  res.render('share', {
    title: 'DevInbox - helping developers share their project',
    description: 'DevInbox connects developers, hackers, and makers of things',
    token: 'werewrwerwrwe',
    categories: [{name: 'Library'}, {name: 'Framework'}, {name: 'App'}, {name: 'Boilerplate'}]
  });
};
