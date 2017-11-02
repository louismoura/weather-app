module.exports = function (grunt) {
  grunt.initConfig({
    sass: {
      dist: {
        files: {
          'styles/main.css': 'styles/styles.sass'
        }
      }
    },
    autoprefixer: {
      style: {
        src: 'styles/main.css',
        dest: 'styles/style.css'
      }
    },

    cssmin: {
      target: {
        files: {
          'styles/style.min.css': 'styles/style.css'
        }
      }
    },

    watch: {
      css: {
        files: ['**/*.sass'],
        tasks: ['sass']
      }
    },

    concat: {
      js: {
        src: ['scripts/player.js', 'scripts/game.js'],
        dest: 'scripts/main.js'
      }
    },

    babel: {
      options: {
        sourceMap: true,
        presets: ['env']
      },
      dist: {
        files: {
          'scripts/main-es5.js': 'scripts/scripts.js'
        }
      }
    },
    uglify: {
      my_target: {
        files: {
          'scripts/main-es5.min.js': 'scripts/main-es5.js'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-uglify');
};
