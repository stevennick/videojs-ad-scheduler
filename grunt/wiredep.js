module.exports = {
  app: {
    src: ['<%= plugin.src %>/../*.html'],
    ignorePath:  /\.\.\//
  },
  test: {
    devDependencies: true,
    ignorePath:  /\.\.\//,
    src: ['<%= plugin.src %>/../*.html'],
    fileTypes: {
      js: {
        block: /(([\s\t]*)\/{2}\s*?bower:\s*?(\S*))(\n|\r|.)*?(\/{2}\s*endbower)/gi,
        detect: {
          js: /'(.*\.js)'/gi
        },
        replace: {
          js: '\'{{filePath}}\','
        }
      }
    }
  }
};
