require.config({
  baseUrl: '/javascripts',
  paths: {
    'jquery': '../vendor/jquery/jquery',
    'lodash': '../vendor/lodash/lodash'
  }
});

//files to include on ALL client side paths
require([
  'jquery',
  'lodash'
], function ($, _) {
  'use strict';
  console.log(_.VERSION);
  console.log($.fn.jquery);
});
