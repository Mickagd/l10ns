
/**
 * Get dependencies
 *
 * @param {Object} localizations
 * @return {Object} representing dependencies
 * @api public
 */
var getDependencies = function(localizations) {
  return {
    '../../libraries/file': {
      readLocalizations: stub().returns(resolvesTo(localizations))
    },
    'mkdirp': stub().callsArgWith(1, null),
    fs: {
      writeFileSync: spy()
    }
  };
};

/**
 * Get localizations
 *
 * @param {String} value message formated
 * @return {Object}
 * @api public
 */

var getLocalizations = function(value) {
  return {
    'en-US': {
      'key-1': {
        value: value
      }
    }
  };
};

/**
 * Indent spaces
 *
 * @param {Number} spaces
 * @param {String} string
 * @return {String}
 * @api public
 */

var indentSpaces = function(spaces, string) {
  for(var i = 0; i<spaces; i++) {
    string = string.replace(/\n/g, '\n ');
  }
  if(/^[^\s]$/.test(string.charAt(0))) {
    for(var i = 0; i<spaces; i++) {
      string = ' ' + string;
    }
  }

  string = string.replace(/\n\s+\n/g, '\n\n');

  return string;
};

var template = require('./templates/build/templates');

describe('Javascript Compiler', function() {
  describe('Sentences', function() {
    it('should be able to compile a single sentece', function(done) {
      var localizations = {
        'en-US': {
          'key-1': {
            value: 'sentence1'
          }
        }
      };
      var dependencies = getDependencies(localizations);
      var compiler = proxyquire('../plugins/javascript/compiler', dependencies);
      compiler.run();
      eventually(function() {
        var functionBody =
        'var string = \'\';\n' +
        'string += \'sentence1\';\n' +
        'return string;';
        expect(dependencies.fs.writeFileSync.args[0][1]).to.eql(template['JavascriptWrapper']({
          functionBody: indentSpaces(8, functionBody)
        }));
        done();
      });
    });

    it('should be able to compile multiple sentences', function(done) {
      var localizations = getLocalizations('sentence1{variable1}sentence2')
        , dependencies = getDependencies(localizations)
        , compiler = proxyquire('../plugins/javascript/compiler', dependencies);

      compiler.run();
      eventually(function() {
        var functionBody =
        'var string = \'\';\n' +
        'string += \'sentence1\';\n' +
        'string += it.variable1;\n' +
        'string += \'sentence2\';\n' +
        'return string;';
        expect(dependencies.fs.writeFileSync.args[0][1]).to.eql(template['JavascriptWrapper']({
          functionBody: indentSpaces(8, functionBody)
        }));
        done();
      });
    });
  });

  describe('Variables', function() {
    it('should be able to compile a single variable', function(done) {
      var localizations = getLocalizations('{variable1}')
        , dependencies = getDependencies(localizations)
        , compiler = proxyquire('../plugins/javascript/compiler', dependencies);

      compiler.run();
      eventually(function() {
        var functionBody =
        'var string = \'\';\n' +
        'string += it.variable1;\n' +
        'return string;';
        expect(dependencies.fs.writeFileSync.args[0][1]).to.eql(template['JavascriptWrapper']({
          functionBody: indentSpaces(8, functionBody)
        }));
        done();
      });
    });

    it('should be able to compile multiple variables', function(done) {
      var localizations = getLocalizations('{variable1}{variable2}')
        , dependencies = getDependencies(localizations)
        , compiler = proxyquire('../plugins/javascript/compiler', dependencies);

      compiler.run();
      eventually(function() {
        var functionBody =
        'var string = \'\';\n' +
        'string += it.variable1;\n' +
        'string += it.variable2;\n' +
        'return string;';
        expect(dependencies.fs.writeFileSync.args[0][1]).to.eql(template['JavascriptWrapper']({
          functionBody: indentSpaces(8, functionBody)
        }));
        done();
      });
    });
  });

  describe('ChoiceFormat', function() {
    it('should be able to compile with a single case', function(done) {
      var localizations = getLocalizations('{variable1, choice, 3#message1}')
        , dependencies = getDependencies(localizations)
        , compiler = proxyquire('../plugins/javascript/compiler', dependencies);

      compiler.run();
      eventually(function() {
        var functionBody =
        'var string = \'\';\n' +
        'string += \'message1\';\n' +
        'return string;';
        expect(dependencies.fs.writeFileSync.args[0][1]).to.eql(template['JavascriptWrapper']({
          functionBody: indentSpaces(8, functionBody)
        }));
        done();
      });
    });

    it('should be able to compile with multiple cases', function(done) {
      var localizations = getLocalizations('{variable1, choice, 1<message1|3#message2}')
        , dependencies = getDependencies(localizations)
        , compiler = proxyquire('../plugins/javascript/compiler', dependencies);

      compiler.run();
      eventually(function() {
        var functionBody =
        'var string = \'\';\n' +
        'if(isNaN(parseFloat(it.variable1)) || it.variable1 <= 1 || it.variable1 > 1 && it.variable1 < 3) {\n' +
        '  string += \'message1\';\n' +
        '}\n' +
        'else if(it.variable1 >= 3 && it.variable1 <= Infinity) {\n' +
        '  string += \'message2\';\n' +
        '}\n' +
        'return string;';
        expect(dependencies.fs.writeFileSync.args[0][1]).to.eql(template['JavascriptWrapper']({
          functionBody: indentSpaces(8, functionBody)
        }));
        done();
      });
    });

    it('should be able to compile with a variable in sub message', function(done) {
      var localizations = getLocalizations('{variable1, choice, 1<{variable2}|3#message2}')
        , dependencies = getDependencies(localizations)
        , compiler = proxyquire('../plugins/javascript/compiler', dependencies);

      compiler.run();
      eventually(function() {
        var functionBody =
        'var string = \'\';\n' +
        'if(isNaN(parseFloat(it.variable1)) || it.variable1 <= 1 || it.variable1 > 1 && it.variable1 < 3) {\n' +
        '  string += it.variable2;\n' +
        '}\n' +
        'else if(it.variable1 >= 3 && it.variable1 <= Infinity) {\n' +
        '  string += \'message2\';\n' +
        '}\n' +
        'return string;';
        expect(dependencies.fs.writeFileSync.args[0][1]).to.eql(template['JavascriptWrapper']({
          functionBody: indentSpaces(8, functionBody)
        }));
        done();
      });
    });

    it('should be able to compile with a variable and sentence in sub message', function(done) {
      var localizations = getLocalizations('{variable1, choice, 1<message1{variable2}|3#message2}')
        , dependencies = getDependencies(localizations)
        , compiler = proxyquire('../plugins/javascript/compiler', dependencies);

      compiler.run();
      eventually(function() {
        var functionBody =
        'var string = \'\';\n' +
        'if(isNaN(parseFloat(it.variable1)) || it.variable1 <= 1 || it.variable1 > 1 && it.variable1 < 3) {\n' +
        '  string += \'message1\';\n' +
        '  string += it.variable2;\n' +
        '}\n' +
        'else if(it.variable1 >= 3 && it.variable1 <= Infinity) {\n' +
        '  string += \'message2\';\n' +
        '}\n' +
        'return string;';
        expect(dependencies.fs.writeFileSync.args[0][1]).to.eql(template['JavascriptWrapper']({
          functionBody: indentSpaces(8, functionBody)
        }));
        done();
      });
    });

    it('should be able to compile with ChoiceFormat in sub message', function(done) {
      var localizations = getLocalizations('{variable1, choice, 1<{variable2, choice, 2#message1|3#message2}|3#message3}')
        , dependencies = getDependencies(localizations)
        , compiler = proxyquire('../plugins/javascript/compiler', dependencies);

      compiler.run();
      eventually(function() {
        var functionBody =
        'var string = \'\';\n' +
        'if(isNaN(parseFloat(it.variable1)) || it.variable1 <= 1 || it.variable1 > 1 && it.variable1 < 3) {\n' +
        '  if(isNaN(parseFloat(it.variable2)) || it.variable2 < 2 || it.variable2 >= 2 && it.variable2 < 3) {\n' +
        '    string += \'message1\';\n' +
        '  }\n' +
        '  else if(it.variable2 >= 3 && it.variable2 <= Infinity) {\n' +
        '    string += \'message2\';\n' +
        '  }\n' +
        '}\n' +
        'else if(it.variable1 >= 3 && it.variable1 <= Infinity) {\n' +
        '  string += \'message3\';\n' +
        '}\n' +
        'return string;';
        expect(dependencies.fs.writeFileSync.args[0][1]).to.eql(template['JavascriptWrapper']({
          functionBody: indentSpaces(8, functionBody)
        }));
        done();
      });
    });

    it('should be able to compile with SelectFormat in sub message', function(done) {
      var localizations = getLocalizations('{variable1, choice, 1<{variable2, select, case1 {message1} other {message2}}}')
        , dependencies = getDependencies(localizations)
        , compiler = proxyquire('../plugins/javascript/compiler', dependencies);

      compiler.run();
      eventually(function() {
        var functionBody =
        'var string = \'\';\n' +
        'switch(it.variable2) {\n' +
        '  case \'case1\':\n' +
        '    string += \'message1\';\n' +
        '    break;\n' +
        '  default:\n' +
        '    string += \'message2\';\n' +
        '    break;\n' +
        '}\n' +
        'return string;';
        expect(dependencies.fs.writeFileSync.args[0][1]).to.eql(template['JavascriptWrapper']({
          functionBody: indentSpaces(8, functionBody)
        }));
        done();
      });
    });

    it('should be able to compile with PluralFormat in sub message', function(done) {
      var localizations = getLocalizations('{variable1, choice, 1<{variable2, plural, one{message1} other{message2}}|3#message3}')
        , dependencies = getDependencies(localizations)
        , compiler = proxyquire('../plugins/javascript/compiler', dependencies);

      compiler.run();
      eventually(function() {
        var functionBody =
        'var string = \'\';\n' +
        'if(isNaN(parseFloat(it.variable1)) || it.variable1 <= 1 || it.variable1 > 1 && it.variable1 < 3) {\n' +
        '  var _case;\n' +
        '  _case = localizations[\'en-US\'].__getPluralKeyword(it.variable2);\n' +
        '  switch(_case) {\n' +
        '    case \'one\':\n' +
        '      string += \'message1\';\n' +
        '      break;\n' +
        '    default:\n' +
        '      string += \'message2\';\n' +
        '      break;\n' +
        '  }\n' +
        '}\n' +
        'else if(it.variable1 >= 3 && it.variable1 <= Infinity) {\n' +
        '  string += \'message3\';\n' +
        '}\n' +
        'return string;';
        expect(dependencies.fs.writeFileSync.args[0][1]).to.eql(template['JavascriptWrapper']({
          functionBody: indentSpaces(8, functionBody)
        }));
        done();
      });
    });
  });

  describe('PluralFormat', function() {
    it('should be able to compile with a single case', function(done) {
      var localizations = getLocalizations('{variable1, plural, other{message1}}')
        , dependencies = getDependencies(localizations)
        , compiler = proxyquire('../plugins/javascript/compiler', dependencies);

      compiler.run();
      eventually(function() {
        var functionBody =
        'var string = \'\';\n' +
        'var _case;\n' +
        '_case = localizations[\'en-US\'].__getPluralKeyword(it.variable1);\n' +
        'switch(_case) {\n' +
        '  default:\n' +
        '    string += \'message1\';\n' +
        '    break;\n' +
        '}\n' +
        'return string;';
        expect(dependencies.fs.writeFileSync.args[0][1]).to.eql(template['JavascriptWrapper']({
          functionBody: indentSpaces(8, functionBody)
        }));
        done();
      });
    });

    it('should be able to compile with multiple cases', function(done) {
      var localizations = getLocalizations('{variable1, plural, one{message1} other{message2}}')
        , dependencies = getDependencies(localizations)
        , compiler = proxyquire('../plugins/javascript/compiler', dependencies);

      compiler.run();
      eventually(function() {
        var functionBody =
        'var string = \'\';\n' +
        'var _case;\n' +
        '_case = localizations[\'en-US\'].__getPluralKeyword(it.variable1);\n' +
        'switch(_case) {\n' +
        '  case \'one\':\n' +
        '    string += \'message1\';\n' +
        '    break;\n' +
        '  default:\n' +
        '    string += \'message2\';\n' +
        '    break;\n' +
        '}\n' +
        'return string;';
        expect(dependencies.fs.writeFileSync.args[0][1]).to.eql(template['JavascriptWrapper']({
          functionBody: indentSpaces(8, functionBody)
        }));
        done();
      });
    });

    it('should be able to compile with a variable in sub message', function(done) {
      var localizations = getLocalizations('{variable1, plural, one{{variable2}} other{message1}}')
        , dependencies = getDependencies(localizations)
        , compiler = proxyquire('../plugins/javascript/compiler', dependencies);

      compiler.run();
      eventually(function() {
        var functionBody =
        'var string = \'\';\n' +
        'var _case;\n' +
        '_case = localizations[\'en-US\'].__getPluralKeyword(it.variable1);\n' +
        'switch(_case) {\n' +
        '  case \'one\':\n' +
        '    string += it.variable2;\n' +
        '    break;\n' +
        '  default:\n' +
        '    string += \'message1\';\n' +
        '    break;\n' +
        '}\n' +
        'return string;';
        expect(dependencies.fs.writeFileSync.args[0][1]).to.eql(template['JavascriptWrapper']({
          functionBody: indentSpaces(8, functionBody)
        }));
        done();
      });
    });

    it('should be able to compile with a variable and sentence in sub message', function(done) {
      var localizations = getLocalizations('{variable1, plural, one{sentence1{variable2}} other{message1}}')
        , dependencies = getDependencies(localizations)
        , compiler = proxyquire('../plugins/javascript/compiler', dependencies);

      compiler.run();
      eventually(function() {
        var functionBody =
        'var string = \'\';\n' +
        'var _case;\n' +
        '_case = localizations[\'en-US\'].__getPluralKeyword(it.variable1);\n' +
        'switch(_case) {\n' +
        '  case \'one\':\n' +
        '    string += \'sentence1\';\n' +
        '    string += it.variable2;\n' +
        '    break;\n' +
        '  default:\n' +
        '    string += \'message1\';\n' +
        '    break;\n' +
        '}\n' +
        'return string;';
        expect(dependencies.fs.writeFileSync.args[0][1]).to.eql(template['JavascriptWrapper']({
          functionBody: indentSpaces(8, functionBody)
        }));
        done();
      });
    });

    it('should be able to compile with a plural remaining in sub message', function(done) {
      var localizations = getLocalizations('{variable1, plural, offset:1 one{sentence1{variable2}} other{sentence1#sentence2}}')
        , dependencies = getDependencies(localizations)
        , compiler = proxyquire('../plugins/javascript/compiler', dependencies);

      compiler.run();
      eventually(function() {
        var functionBody =
        'var string = \'\';\n' +
        'var _case;\n' +
        '_case = localizations[\'en-US\'].__getPluralKeyword(it.variable1);\n' +
        'switch(_case) {\n' +
        '  case \'one\':\n' +
        '    string += \'sentence1\';\n' +
        '    string += it.variable2;\n' +
        '    break;\n' +
        '  default:\n' +
        '    string += \'sentence1\';\n' +
        '    string += (it.variable1 - parseInt(1, 10));\n' +
        '    string += \'sentence2\';\n' +
        '    break;\n' +
        '}\n' +
        'return string;';
        expect(dependencies.fs.writeFileSync.args[0][1]).to.eql(template['JavascriptWrapper']({
          functionBody: indentSpaces(8, functionBody)
        }));
        done();
      });
    });

    it('should be able to compile with PluralFormat in sub message', function(done) {
      var localizations = getLocalizations('{variable1, plural, one {{variable2, plural, one {message1} other {message2}}} other{message3}}')
        , dependencies = getDependencies(localizations)
        , compiler = proxyquire('../plugins/javascript/compiler', dependencies);

      compiler.run();
      eventually(function() {
        var functionBody =
        'var string = \'\';\n' +
        'var _case;\n' +
        '_case = localizations[\'en-US\'].__getPluralKeyword(it.variable1);\n' +
        'switch(_case) {\n' +
        '  case \'one\':\n' +
        '    var _case;\n' +
        '    _case = localizations[\'en-US\'].__getPluralKeyword(it.variable2);\n' +
        '    switch(_case) {\n' +
        '      case \'one\':\n' +
        '        string += \'message1\';\n' +
        '        break;\n' +
        '      default:\n' +
        '        string += \'message2\';\n' +
        '        break;\n' +
        '    }\n' +
        '    break;\n' +
        '  default:\n' +
        '    string += \'message3\';\n' +
        '    break;\n' +
        '}\n' +
        'return string;';
        expect(dependencies.fs.writeFileSync.args[0][1]).to.eql(template['JavascriptWrapper']({
          functionBody: indentSpaces(8, functionBody)
        }));
        done();
      });
    });

    it('should be able to compile with ChoiceFormat in sub message', function(done) {
      var localizations = getLocalizations('{variable1, plural, one {{variable2, choice, 1#message1|3#message2}} other{message3}}')
        , dependencies = getDependencies(localizations)
        , compiler = proxyquire('../plugins/javascript/compiler', dependencies);

      compiler.run();
      eventually(function() {
        var functionBody =
        'var string = \'\';\n' +
        'var _case;\n' +
        '_case = localizations[\'en-US\'].__getPluralKeyword(it.variable1);\n' +
        'switch(_case) {\n' +
        '  case \'one\':\n' +
        '    if(isNaN(parseFloat(it.variable2)) || it.variable2 < 1 || it.variable2 >= 1 && it.variable2 < 3) {\n' +
        '      string += \'message1\';\n' +
        '    }\n' +
        '    else if(it.variable2 >= 3 && it.variable2 <= Infinity) {\n' +
        '      string += \'message2\';\n' +
        '    }\n' +
        '    break;\n' +
        '  default:\n' +
        '    string += \'message3\';\n' +
        '    break;\n' +
        '}\n' +
        'return string;';
        expect(dependencies.fs.writeFileSync.args[0][1]).to.eql(template['JavascriptWrapper']({
          functionBody: indentSpaces(8, functionBody)
        }));
        done();
      });
    });

    it('should be able to compile with SelectFormat in sub message', function(done) {
      var localizations = getLocalizations('{variable1, plural, one {{variable2, select, case1 {message1} other {message2}}} other {message3}}')
        , dependencies = getDependencies(localizations)
        , compiler = proxyquire('../plugins/javascript/compiler', dependencies);

      compiler.run();
      eventually(function() {
        var functionBody =
        'var string = \'\';\n' +
        'var _case;\n' +
        '_case = localizations[\'en-US\'].__getPluralKeyword(it.variable1);\n' +
        'switch(_case) {\n' +
        '  case \'one\':\n' +
        '    switch(it.variable2) {\n' +
        '      case \'case1\':\n' +
        '        string += \'message1\';\n' +
        '        break;\n' +
        '      default:\n' +
        '        string += \'message2\';\n' +
        '        break;\n' +
        '    }\n' +
        '    break;\n' +
        '  default:\n' +
        '    string += \'message3\';\n' +
        '    break;\n' +
        '}\n' +
        'return string;';
        expect(dependencies.fs.writeFileSync.args[0][1]).to.eql(template['JavascriptWrapper']({
          functionBody: indentSpaces(8, functionBody)
        }));
        done();
      });
    });
  });

  describe('SelectFormat', function() {
    it('should be able to compile with a single case', function(done) {
      var localizations = getLocalizations('{variable1, select, other{message1}}')
        , dependencies = getDependencies(localizations)
        , compiler = proxyquire('../plugins/javascript/compiler', dependencies);

      compiler.run();
      eventually(function() {
        var functionBody =
        'var string = \'\';\n' +
        'switch(it.variable1) {\n' +
        '  default:\n' +
        '    string += \'message1\';\n' +
        '    break;\n' +
        '}\n' +
        'return string;';
        expect(dependencies.fs.writeFileSync.args[0][1]).to.eql(template['JavascriptWrapper']({
          functionBody: indentSpaces(8, functionBody)
        }));
        done();
      });
    });

    it('should be able to compile with multiple cases', function(done) {
      var localizations = getLocalizations('{variable1, select, case1 {message1} case2 {message2} other {message3}}')
        , dependencies = getDependencies(localizations)
        , compiler = proxyquire('../plugins/javascript/compiler', dependencies);

      compiler.run();
      eventually(function() {
        var functionBody =
        'var string = \'\';\n' +
        'switch(it.variable1) {\n' +
        '  case \'case1\':\n' +
        '    string += \'message1\';\n' +
        '    break;\n' +
        '  case \'case2\':\n' +
        '    string += \'message2\';\n' +
        '    break;\n' +
        '  default:\n' +
        '    string += \'message3\';\n' +
        '    break;\n' +
        '}\n' +
        'return string;';
        expect(dependencies.fs.writeFileSync.args[0][1]).to.eql(template['JavascriptWrapper']({
          functionBody: indentSpaces(8, functionBody)
        }));
        done();
      });
    });

    it('should be able to compile with a variable in sub message', function(done) {
      var localizations = getLocalizations('{variable1, select, case1 {{variable2}} other {message3}}')
        , dependencies = getDependencies(localizations)
        , compiler = proxyquire('../plugins/javascript/compiler', dependencies);

      compiler.run();
      eventually(function() {
        var functionBody =
        'var string = \'\';\n' +
        'switch(it.variable1) {\n' +
        '  case \'case1\':\n' +
        '    string += it.variable2;\n' +
        '    break;\n' +
        '  default:\n' +
        '    string += \'message3\';\n' +
        '    break;\n' +
        '}\n' +
        'return string;';
        expect(dependencies.fs.writeFileSync.args[0][1]).to.eql(template['JavascriptWrapper']({
          functionBody: indentSpaces(8, functionBody)
        }));
        done();
      });
    });

    it('should be able to compile with a variable and sentence in sub message', function(done) {
      var localizations = getLocalizations('{variable1, select, case1 {sentence1{variable2}} other {message3}}')
        , dependencies = getDependencies(localizations)
        , compiler = proxyquire('../plugins/javascript/compiler', dependencies);

      compiler.run();
      eventually(function() {
        var functionBody =
        'var string = \'\';\n' +
        'switch(it.variable1) {\n' +
        '  case \'case1\':\n' +
        '    string += \'sentence1\';\n' +
        '    string += it.variable2;\n' +
        '    break;\n' +
        '  default:\n' +
        '    string += \'message3\';\n' +
        '    break;\n' +
        '}\n' +
        'return string;';
        expect(dependencies.fs.writeFileSync.args[0][1]).to.eql(template['JavascriptWrapper']({
          functionBody: indentSpaces(8, functionBody)
        }));
        done();
      });
    });

    it('should be able to compile with a ChoiceFormat in sub message', function(done) {
      var localizations = getLocalizations('{variable1, select, case1 {{variable2, choice, 1<message1|2#message2}} other {message3}}')
        , dependencies = getDependencies(localizations)
        , compiler = proxyquire('../plugins/javascript/compiler', dependencies);

      compiler.run();
      eventually(function() {
        var functionBody =
        'var string = \'\';\n' +
        'switch(it.variable1) {\n' +
        '  case \'case1\':\n' +
        '    if(isNaN(parseFloat(it.variable2)) || it.variable2 <= 1 || it.variable2 > 1 && it.variable2 < 2) {\n' +
        '      string += \'message1\';\n' +
        '    }\n' +
        '    else if(it.variable2 >= 2 && it.variable2 <= Infinity) {\n' +
        '      string += \'message2\';\n' +
        '    }\n' +
        '    break;\n' +
        '  default:\n' +
        '    string += \'message3\';\n' +
        '    break;\n' +
        '}\n' +
        'return string;';
        expect(dependencies.fs.writeFileSync.args[0][1]).to.eql(template['JavascriptWrapper']({
          functionBody: indentSpaces(8, functionBody)
        }));
        done();
      });
    });

    it('should be able to compile with a SelectFormat in sub message', function(done) {
      var localizations = getLocalizations('{variable1, select, case1 {{variable2, select, case1 {message1} other {message2}}} other {message3}}')
        , dependencies = getDependencies(localizations)
        , compiler = proxyquire('../plugins/javascript/compiler', dependencies);

      compiler.run();
      eventually(function() {
        var functionBody =
        'var string = \'\';\n' +
        'switch(it.variable1) {\n' +
        '  case \'case1\':\n' +
        '    switch(it.variable2) {\n' +
        '      case \'case1\':\n' +
        '        string += \'message1\';\n' +
        '        break;\n' +
        '      default:\n' +
        '        string += \'message2\';\n' +
        '        break;\n' +
        '    }\n' +
        '    break;\n' +
        '  default:\n' +
        '    string += \'message3\';\n' +
        '    break;\n' +
        '}\n' +
        'return string;';
        expect(dependencies.fs.writeFileSync.args[0][1]).to.eql(template['JavascriptWrapper']({
          functionBody: indentSpaces(8, functionBody)
        }));
        done();
      });
    });

    it('should be able to compile with a PluralFormat in sub message', function(done) {
      var localizations = getLocalizations('{variable1, select, case1 {{variable2, plural, one {message1} other {message2}}} other {message3}}')
        , dependencies = getDependencies(localizations)
        , compiler = proxyquire('../plugins/javascript/compiler', dependencies);

      compiler.run();
      eventually(function() {
        var functionBody =
        'var string = \'\';\n' +
        'switch(it.variable1) {\n' +
        '  case \'case1\':\n' +
        '    var _case;\n' +
        '    _case = localizations[\'en-US\'].__getPluralKeyword(it.variable2);\n' +
        '    switch(_case) {\n' +
        '      case \'one\':\n' +
        '        string += \'message1\';\n' +
        '        break;\n' +
        '      default:\n' +
        '        string += \'message2\';\n' +
        '        break;\n' +
        '    }\n' +
        '    break;\n' +
        '  default:\n' +
        '    string += \'message3\';\n' +
        '    break;\n' +
        '}\n' +
        'return string;';
        expect(dependencies.fs.writeFileSync.args[0][1]).to.eql(template['JavascriptWrapper']({
          functionBody: indentSpaces(8, functionBody)
        }));
        done();
      });
    });
  });
});
