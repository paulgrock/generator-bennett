/*global module:false*/
module.exports = function(grunt) {
  var path = require('path');
  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt);
  // Project configuration
  grunt.initConfig({
    akamai: function() {
      var filePath = process.env.HOME + '/.ssh/akamai';
      if(grunt.file.exists(filePath)) {
        return grunt.file.read(filePath);
      } else {
        return grunt.file.write(filePath, '');
      }
    },
    jsDir: 'public/javascripts',
    stylesDir: 'public/stylesheets',
    distDir: 'public/dist',
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: ['<%= jsDir %>/**/*.js', '!<%= jsDir %>/vendorjs-changed/**/*.js']
    },
    compass: {
      options: {
        sassDir: '<%= stylesDir %>',
        cssDir: '<%= stylesDir %>',
        fontsDir: '<%= stylesDir %>/fonts',
        imagesDir: 'public/images',
        httpImagesPath: '/images',
        javascriptsDir: '<%= jsDir %>',
        force: true,
        assetCacheBuster: false
      },
      dev: {
        options: {
          outputStyle: 'nested'
        }
      },
      prd: {
        options: {
          cssDir: '<%= distDir %>/stylesheets',
          environment: 'production',
          outputStyle: 'compressed',
          httpPath: '',
          assetCacheBuster: false,
          httpImagesPath: '<%= compass.prd.options.httpPath %>/images'
        }
      }
    },
    express: {
      options: {
        script: 'app.js'
      },
      dev: {
        options: {
          debug: true,
          node_env: 'local'
        }
      }
    },
    "git-describe": {
      options: {
        template: '{%=tag%}'
      },
      describeCommit: {}
    },
    watch: {
      options: {
        livereload: true,
        spawn: false // Without this option specified, Express won't be reloaded
      },
      vendorCSS: {
        files: ['public/vendor/**/*.css'],
        tasks: ['copy:vendorCSS','compass:dev']
      },
      styles: {
        files: ['<%= stylesDir %>/**/*.sass', '<%= stylesDir %>/**/*.scss'],
        tasks: ['compass:dev']
      },
      src: {
        files: ['views/**/*.jade', 'Gruntfile.js', '<%= jsDir %>/**/*.js']
      },
      server: {
        files: ['app.js', 'routes/**/*.js', 'static-json/**/*.json', 'locales/**/*.json', 'lib/**/*.js'],
        tasks: ['express:dev']
      },
      images: {
        options: {
          event: ['added', 'changed'],
        },
        files: ['public/images/**/*.{jpg,jpeg,gif}'],
        tasks: ['imagemin:main']
      }
    },
    copy: {
      vendorCSS: {
        files: [
          {
            expand: true,
            src: ['public/vendor/**/*.css'],
            dest: 'public/vendor/',
            rename: function(dest, src) {
              return src.slice(0, src.length - 3) + 'scss';
            }
          }
        ]
      }
    },
    hashmap: {
      options: {
        hashlen: 8,
        rename: '#{= dirname}/#{= basename}.#{= hash}#{= extname}',
        output: 'config/hash.json'
      },
      images: {
        cwd: 'public',
        src: 'images/**/*.{png,jpg,jpeg,gif}',
        dest: '<%= distDir %>'
      }
    },
    cssurlrev: {
      options: {
        assets: 'config/hash.json'
      },
      css: {
        src: '<%= compass.prd.options.cssDir %>/**/*.css'
      },
    },
    imagemin: {
      options: {
        optimizationLevel: 7
      },
      main: {
        files: [{
          expand: true,
          cwd: 'public/images/',
          src: ['**/*.{jpg,jpeg,gif}'],
          dest: 'public/images/'
        }]
      }
    },
    bom: ['locales/**/*.json'],
    sftp: {
      options: {
        path: '/225453/static/heroes/<%= grunt.option("gitRevision") %>',
        host: 'blizzardpub.upload.akamai.com',
        srcBasePath: '<%= distDir %>',
        createDirectories: true,
        username: process.env.AKAMAI_USERNAME,
        privateKey: '<%= akamai() %>'
      },
      uploadAssets: {
        files: {
          './': '<%= distDir %>/**/*'
        }
      }
    },
    clean: ['<%= distDir %>'],
    bower: {
      options: {
        exclude: ['modernizr', 'requirejs']
      },
      target: {
        rjsConfig: '<%= jsDir %>/common.js'
      }
    },
    requirejs: {
      options: {
        modules: [
          // First set up the common build layer
          {
            name: 'common'
          },
          {
            name: 'home/main',
            exclude: ['common']
          },
          {
            name: 'heroes/hero',
            exclude: ['common']
          },
          {
            name: 'hero-index/controller',
            exclude: ['common']
          },
          {
            name: 'news/controller',
            exclude: ['common']
          },
          {
            name: 'news/entry-controller',
            exclude: ['common']
          },
          {
            name: 'media/main',
            exclude: ['common']
          },
          {
            name: 'game/main',
            exclude: ['common']
          }
        ],
        optimize: 'uglify2',
        preserveLicenseComments: false,
        optimizeCss: 'none',
        skipDirOptimize: true,
        fileExclusionRegExp: /^\./,
        mainConfigFile: '<%= bower.target.rjsConfig %>'
      },
      prd: {
        options: {
          appDir: '<%= jsDir %>',
          dir: '<%= distDir %>/javascripts',
          baseUrl: './'
        }
      }
    },
    plato : {
      main : {
        src : [ '**/*.js', '!public/vendor/**/*.js' ],
        dest : 'reports'
      }
    }
  });

  grunt.registerTask('filerevWrite', 'Write filerev summary to disk', function(){
    var hashMap = grunt.file.readJSON('config/hash.json');
    var newHash = {};
    Object.keys(hashMap).forEach(function(key){
      var item = hashMap[key];
      var ext = path.extname(key);
      var basename = path.basename(key, ext);
      newHash['/' + key] = '//opcdn.battle.net/static/heroes/' + path.dirname(key) + '/' + basename + '.' + item + ext;
    });
    grunt.file.write('config/hash.json', JSON.stringify(newHash, null, 2));
  });

  grunt.registerTask('imagerev', ['hashmap', 'filerevWrite', 'cssurlrev']);

  grunt.registerTask('saveRevision', function() {
    grunt.event.once('git-describe', function (rev) {
      grunt.option('gitRevision', rev);
    });
    grunt.task.run('git-describe');
  });

  // Default task
  grunt.registerTask('default', [
    'copy:vendorCSS',
    'express:dev',
    'watch'
  ]);

  grunt.registerTask('build:local', [
    'saveRevision',
    'copy:vendorCSS',
    'compass:prd',
    'imagerev',
    'requirejs:prd'
  ]);

  grunt.registerTask('build', [
    'build:local',
    'sftp:uploadAssets',
    'clean'
  ]);

  grunt.registerTask('server', [
    'default'
  ]);
};
