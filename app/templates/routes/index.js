'use strict';
/*
 * GET home page.
 */

exports.index = function(req, res) {
  res.render('home/index', {
    title: 'Bennett Generator'
  });
};
