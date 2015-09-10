'use strict';

module.exports = function(grunt) {
  var path = require('path');
  var bowerConfig = require('./bower.json');

  var config = {
    configPath: path.join(process.cwd(), 'grunt'),

    init: true,
    // Configurable paths for the application
    data: {
      bower_components: './bower_components',
      plugin: {
        configPath: process.cwd(),
        src: 'src',
        app: bowerConfig.appPath || 'lib',
        dist: 'dist'
      },
      pkg: grunt.file.readJSON('package.json'),
      banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;' +
        ' Licensed <%= pkg.license %> */\n',
    },

    loadGruntTasks: {

    },

    //can post process config object before it gets passed to grunt
    postProcess: function(config) {},

    //allows to manipulate the config object before it gets merged with the data object
    preMerge: function(config, data) {}
  };

  // Load grunt config and tasks automatically
  // To change grunt tasks, please go into grunt directory instead here.
  require('load-grunt-config')(grunt, config);
};
