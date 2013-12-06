'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');


var BennettGenerator = module.exports = function BennettGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);
  this.appName = path.basename(process.cwd());
  this.on('end', function () {
    this.installDependencies({ skipInstall: options['skip-install'] });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(BennettGenerator, yeoman.generators.Base);

BennettGenerator.prototype.app = function app() {
  this.mkdir('public/vendor');
  this.mkdir('public/images');
  this.mkdir('public/javascripts');
  this.mkdir('public/stylesheets');
  this.mkdir('routes');
  this.mkdir('tests');
  this.mkdir('views');
  this.mkdir('views/home');
  this.mkdir('views/layouts');
  this.template('_package.json', 'package.json');
  this.template('_bower.json', 'bower.json');
};

BennettGenerator.prototype.projectfiles = function projectfiles() {
  this.copy('_testem.json', 'testem.json');
  this.copy('bowerrc', '.bowerrc');
  this.copy('gitignore', '.gitignore');
  this.copy('_app.js', 'app.js');
  this.copy('editorconfig', '.editorconfig');
  this.copy('Gruntfile.js', 'Gruntfile.js');
  this.copy('jshintrc', '.jshintrc');
  this.copy('routes/index.js', 'routes/index.js');
  this.copy('views/home/index.jade', 'views/index.jade');
  this.copy('views/layouts/main.jade', 'views/layout.jade');
  this.copy('javascripts/common.js', 'public/javascripts/common.js');
  this.copy('tests/_index', 'tests/index.mustache');
};
