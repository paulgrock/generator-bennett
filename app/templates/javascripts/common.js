require.config({
  baseUrl: '/javascripts',
  paths: {
    jquery: '../vendor/jquery/jquery',
    lodash: '../vendor/lodash/dist/lodash',
    text: '../vendor/requirejs-text/text',
    fastclick: '../vendor/fastclick/lib/fastclick',
    moment: '../vendor/moment/moment'
  }
});

// Files to include on ALL client side paths
require([
  'jquery',
  'lodash',
  'fastclick'
], function ($, _, FastClick) {
  'use strict';
  console.log(_.VERSION);
  console.log($.fn.jquery);
});
