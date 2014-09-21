
/**
 * Module dependencies
 */

var fs = require('fs')
  , path = require('path');

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

eval(fs.readFileSync(path.join(__dirname, '../templates/FormatNumberFunction.tmpl'), 'utf-8'));
eval(fs.readFileSync(path.join(__dirname, '../templates/RoundToFunction.tmpl'), 'utf-8'));

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

  describe('NumberFormat', function() {
    describe('compilation', function() {
      it('should be able to compile a non-absent number', function(done) {
        var localizations = getLocalizations('{variable1, number, 0}')
          , dependencies = getDependencies(localizations)
          , compiler = proxyquire('../plugins/javascript/compiler', dependencies);

        compiler.run();
        eventually(function() {
          var functionBody =
          'var string = \'\';\n' +
          'if(it.variable1 >= 0) {\n' +
          '  string += formatNumber({\n' +
          '    number: it.variable1,\n' +
          '    type: \'floating\',\n' +
          '    roundTo: 1,\n' +
          '    prefix: \'\',\n' +
          '    suffix: \'\',\n' +
          '    percentage: null,\n' +
          '    permille: null,\n' +
          '    currency: null,\n' +
          '    groupSize: null,\n' +
          '    exponent: null,\n' +
          '    minimumIntegerDigits: 1,\n' +
          '    maximumIntegerDigits: 1,\n' +
          '    minimumFractionDigits: 0,\n' +
          '    maximumFractionDigits: 0,\n' +
          '    minimumSignificantDigits: 0,\n' +
          '    maximumSignificantDigits: 0,\n' +
          '    symbols: localizations[\'en-US\'].__numberSymbols,\n' +
          '    paddingCharacter: null,\n' +
          '    patternLength: 1\n' +
          '  });\n' +
          '}\n' +
          'else {\n' +
          '  string += formatNumber({\n' +
          '    number: it.variable1,\n' +
          '    type: \'floating\',\n' +
          '    roundTo: 1,\n' +
          '    prefix: \'-\',\n' +
          '    suffix: \'\',\n' +
          '    percentage: null,\n' +
          '    permille: null,\n' +
          '    currency: null,\n' +
          '    groupSize: null,\n' +
          '    exponent: null,\n' +
          '    minimumIntegerDigits: 1,\n' +
          '    maximumIntegerDigits: 1,\n' +
          '    minimumFractionDigits: 0,\n' +
          '    maximumFractionDigits: 0,\n' +
          '    minimumSignificantDigits: 0,\n' +
          '    maximumSignificantDigits: 0,\n' +
          '    symbols: localizations[\'en-US\'].__numberSymbols,\n' +
          '    paddingCharacter: null,\n' +
          '    patternLength: 1\n' +
          '  });\n' +
          '}\n' +
          'return string;';
          expect(dependencies.fs.writeFileSync.args[0][1]).to.eql(template['JavascriptWrapper']({
            functionBody: indentSpaces(8, functionBody)
          }));
          done();
        });
      });
    });
    var symbols = {
      decimal: '.',
      group: ',',
      list: ';',
      percentSign: '%',
      plusSign: '+',
      minusSign: '-',
      exponential: 'E',
      superscriptingExponent: '×',
      perMille: '‰',
      infinity: '∞',
      nan: 'NaN'
    };
    describe('formatNumber()', function() {
      it('should be able to group primary', function() {
        var number = formatNumber({
          prefix: '',
          suffix: '',
          roundTo: 1,
          number: 1000,
          percentage: false,
          permille: false,
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 1,
          type: 'floating',
          groupSize: {
            primary: 3,
            secondary: 3
          },
          symbols: symbols
        });
        expect(number).to.equal('1,000');
      });

      it('should be able to group primary and secondary', function() {
        var number = formatNumber({
          prefix: '',
          suffix: '',
          roundTo: 1,
          number: 1000000,
          percentage: false,
          permille: false,
          fraction: null,
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 1,
          type: 'floating',
          groupSize: {
            primary: 3,
            secondary: 3
          },
          symbols: symbols
        });
        expect(number).to.equal('1,000,000');
        var number = formatNumber({
          prefix: '',
          suffix: '',
          roundTo: 1,
          number: 1000000,
          percentage: false,
          permille: false,
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 1,
          type: 'floating',
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('10,00,000');
        var number = formatNumber({
          prefix: '',
          suffix: '',
          roundTo: 1,
          number: 100000000,
          percentage: false,
          permille: false,
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 1,
          type: 'floating',
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('10,00,00,000');
      });

      it('should be able to add trailing zeros whenever minimum fraction digits is not met', function() {
        var number = formatNumber({
          prefix: '',
          suffix: '',
          roundTo: 0.01,
          number: 0.2,
          percentage: false,
          permille: false,
          maximumFractionDigits: 3,
          minimumFractionDigits: 2,
          minimumIntegerDigits: 1,
          type: 'floating',
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('0.20');
      });

      it('should round to the defined increment when number of fraction digits exceeds maximum fraction digits', function() {
        var number = formatNumber({
          prefix: '',
          suffix: '',
          roundTo: 0.001,
          number: 0.1236,
          percentage: false,
          permille: false,
          maximumFractionDigits: 3,
          minimumFractionDigits: 2,
          minimumIntegerDigits: 1,
          type: 'floating',
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('0.124');
      });

      it('should be able to render maximum fraction digits', function() {
        var number = formatNumber({
          prefix: '',
          suffix: '',
          roundTo: 0.001,
          number: 0.1333,
          percentage: false,
          permille: false,
          maximumFractionDigits: 3,
          minimumFractionDigits: 2,
          minimumIntegerDigits: 1,
          type: 'floating',
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('0.133');
      });

      it('should not render fraction digits that are zero', function() {
        var number = formatNumber({
          prefix: '',
          suffix: '',
          roundTo: 0.001,
          number: 0.1200,
          percentage: false,
          permille: false,
          maximumFractionDigits: 3,
          minimumFractionDigits: 2,
          minimumIntegerDigits: 1,
          type: 'floating',
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('0.12');
      });

      it('should prepend zeros whenever minimum integers is not met', function() {
        var number = formatNumber({
          prefix: '',
          suffix: '',
          roundTo: 1,
          number: 1,
          percentage: false,
          permille: false,
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 2,
          type: 'floating',
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('01');
      });

      it('should be able to render percentages', function() {
        var number = formatNumber({
          prefix: '',
          suffix: '%',
          roundTo: 0.001,
          number: 0.1230,
          percentage: true,
          permille: false,
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 2,
          type: 'floating',
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('12%');
        var number = formatNumber({
          prefix: '',
          suffix: ' %',
          roundTo: 0.001,
          number: 0.1230,
          percentage: true,
          permille: false,
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 2,
          type: 'floating',
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('12 %');
        var number = formatNumber({
          prefix: '%',
          suffix: '',
          roundTo: 0.001,
          number: 0.1230,
          percentage: true,
          permille: false,
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 2,
          type: 'floating',
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('%12');
        var number = formatNumber({
          prefix: '% ',
          suffix: '',
          roundTo: 0.001,
          number: 0.1230,
          percentage: true,
          permille: false,
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 2,
          type: 'floating',
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('% 12');
      });

      it('should be able to render permille', function() {
        var number = formatNumber({
          prefix: '',
          suffix: '‰',
          roundTo: 0.001,
          number: 0.1230,
          percentage: false,
          permille: true,
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 1,
          type: 'floating',
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('123‰');
        var number = formatNumber({
          prefix: '‰',
          suffix: '',
          roundTo: 0.001,
          number: 0.1230,
          percentage: false,
          permille: true,
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 1,
          type: 'floating',
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('‰123');
        var number = formatNumber({
          prefix: '‰ ',
          suffix: '',
          roundTo: 0.001,
          number: 0.1230,
          percentage: false,
          permille: true,
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 1,
          type: 'floating',
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('‰ 123');
        var number = formatNumber({
          prefix: '',
          suffix: ' ‰',
          roundTo: 0.001,
          number: 0.1230,
          percentage: false,
          permille: true,
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 1,
          type: 'floating',
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('123 ‰');
      });

      it('should be able to render a prefix', function() {
        var number = formatNumber({
          prefix: '$',
          suffix: '',
          roundTo: 1,
          number: 10,
          percentage: false,
          permille: false,
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 1,
          type: 'floating',
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('$10');
      });

      it('should be able to render a suffix', function() {
        var number = formatNumber({
          prefix: '',
          suffix: '$',
          roundTo: 1,
          number: 10,
          percentage: false,
          permille: false,
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 1,
          type: 'floating',
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('10$');
      });

      it('should be able to render currency', function() {
        var number = formatNumber({
          prefix: '¤',
          suffix: '',
          roundTo: 1,
          number: 10,
          percentage: false,
          permille: false,
          currency: {
            symbol: '$'
          },
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 1,
          type: 'floating',
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('$10');
      });

      it('should be able to append a space if a non-currency symbol surrounds a digit', function() {
        var number = formatNumber({
          prefix: '¤',
          suffix: '',
          roundTo: 1,
          number: 10,
          percentage: false,
          permille: false,
          currency: {
            symbol: '$NT'
          },
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 1,
          type: 'floating',
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('$NT 10');
      });

      it('should not append a space if a non-currency symbol surrounds a digit', function() {
        var number = formatNumber({
          prefix: '¤',
          suffix: '',
          roundTo: 1,
          number: 10,
          percentage: false,
          permille: false,
          currency: {
            symbol: '$'
          },
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 1,
          type: 'floating',
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('$10');
      });

      it('should be able to prepend a space if a non-currency symbol surrounds a digit', function() {
        var number = formatNumber({
          prefix: '',
          suffix: '¤',
          roundTo: 1,
          number: 10,
          percentage: false,
          permille: false,
          currency: {
            symbol: 'US$'
          },
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 1,
          type: 'floating',
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('10 US$');
      });

      it('should not prepend a space if a non-currency symbol surrounds a digit', function() {
        var number = formatNumber({
          prefix: '',
          suffix: '¤',
          roundTo: 1,
          number: 10,
          percentage: false,
          permille: false,
          currency: {
            symbol: '$'
          },
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 1,
          type: 'floating',
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('10$');
      });

      it('should be able to format a significant integer number', function() {
        var number = formatNumber({
          type: 'significant',
          prefix: '',
          suffix: '',
          roundTo: 1,
          number: 11,
          percentage: false,
          permille: false,
          currency: null,
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 0,
          maximumSignificantDigits: 1,
          minimumSignificantDigits: 1,
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('10');
      });

      it('should be able to format a significant fraction number', function() {
        var number = formatNumber({
          type: 'significant',
          prefix: '',
          suffix: '',
          roundTo: 1,
          number: 0.1200,
          percentage: false,
          permille: false,
          currency: null,
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 0,
          maximumSignificantDigits: 2,
          minimumSignificantDigits: 2,
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('0.12');
      });

      it('should be able to format a significant fraction number by adding trailing zeros', function() {
        var number = formatNumber({
          type: 'significant',
          prefix: '',
          suffix: '',
          roundTo: 1,
          number: 0.1200,
          percentage: false,
          permille: false,
          currency: null,
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 0,
          maximumSignificantDigits: 3,
          minimumSignificantDigits: 3,
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('0.120');
      });

      it('should be able to format a significant integer and fraction number by adding trailing zeros', function() {
        var number = formatNumber({
          type: 'significant',
          prefix: '',
          suffix: '',
          roundTo: 1,
          number: 1.1200,
          percentage: false,
          permille: false,
          currency: null,
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 0,
          maximumSignificantDigits: 4,
          minimumSignificantDigits: 4,
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('1.120');
      });

      it('should be able to format a significant number with group separators', function() {
        var number = formatNumber({
          type: 'significant',
          prefix: '',
          suffix: '',
          roundTo: 1,
          number: 1120000,
          percentage: false,
          permille: false,
          currency: null,
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 0,
          maximumSignificantDigits: 4,
          minimumSignificantDigits: 4,
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('11,20,000');
      });

      it('should be able to format a significant fraction in percentage', function() {
        var number = formatNumber({
          type: 'significant',
          prefix: '',
          suffix: '%',
          roundTo: 1,
          number: 0.00789,
          percentage: true,
          permille: false,
          currency: null,
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 0,
          maximumSignificantDigits: 1,
          minimumSignificantDigits: 1,
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('0.8%');
      });

      it('should be able to format a significant integer in percentage', function() {
        var number = formatNumber({
          type: 'significant',
          prefix: '',
          suffix: '%',
          roundTo: 1,
          number: 0.789,
          percentage: true,
          permille: false,
          currency: null,
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 0,
          maximumSignificantDigits: 2,
          minimumSignificantDigits: 2,
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('79%');
      });

      it('should be able to format a significant integer and fraction in percentage', function() {
        var number = formatNumber({
          type: 'significant',
          prefix: '',
          suffix: '%',
          roundTo: 1,
          number: 0.789,
          percentage: true,
          permille: false,
          currency: null,
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 0,
          maximumSignificantDigits: 3,
          minimumSignificantDigits: 3,
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('78.9%');
      });

      it('should be able to format a significant number with group separators', function() {
        var number = formatNumber({
          type: 'significant',
          prefix: '',
          suffix: '%',
          roundTo: 1,
          number: 78900,
          percentage: true,
          permille: false,
          currency: null,
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 0,
          maximumSignificantDigits: 3,
          minimumSignificantDigits: 3,
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('78,90,000%');
      });

      it('should be able to format a significant fraction in percentage', function() {
        var number = formatNumber({
          type: 'significant',
          prefix: '',
          suffix: '‰',
          roundTo: 1,
          number: 0.000789,
          percentage: false,
          permille: true,
          currency: null,
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 0,
          maximumSignificantDigits: 1,
          minimumSignificantDigits: 1,
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('0.8‰');
      });

      it('should be able to format a significant integer in percentage', function() {
        var number = formatNumber({
          type: 'significant',
          prefix: '',
          suffix: '‰',
          roundTo: 1,
          number: 0.0789,
          percentage: false,
          permille: true,
          currency: null,
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 0,
          maximumSignificantDigits: 2,
          minimumSignificantDigits: 2,
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('79‰');
      });

      it('should be able to format a significant integer and fraction in percentage', function() {
        var number = formatNumber({
          type: 'significant',
          prefix: '',
          suffix: '‰',
          roundTo: 1,
          number: 0.0789,
          percentage: false,
          permille: true,
          currency: null,
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 0,
          maximumSignificantDigits: 3,
          minimumSignificantDigits: 3,
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('78.9‰');
      });

      it('should be able to format a significant number with group separators', function() {
        var number = formatNumber({
          type: 'significant',
          prefix: '',
          suffix: '‰',
          roundTo: 1,
          number: 789,
          percentage: false,
          permille: true,
          currency: null,
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 0,
          maximumSignificantDigits: 3,
          minimumSignificantDigits: 3,
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('7,89,000‰');
      });

      it('should be able to format an exponent number with only minimum integer digits specified', function() {
        var number = formatNumber({
          type: 'floating',
          prefix: '',
          suffix: '',
          roundTo: 1,
          number: 12000,
          percentage: false,
          permille: false,
          currency: null,
          exponent: {
            digits: 1,
            plusSign: false
          },
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 2,
          maximumIntegerDigits: 2,
          maximumSignificantDigits: 3,
          minimumSignificantDigits: 3,
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('12E3');
      });

      it('should be able to format an exponent number with minimum fraction digits and minimum integer digits specified', function() {
        var number = formatNumber({
          type: 'floating',
          prefix: '',
          suffix: '',
          roundTo: 1,
          number: 12000,
          percentage: false,
          permille: false,
          currency: null,
          exponent: {
            digits: 1,
            plusSign: false
          },
          maximumFractionDigits: 4,
          minimumFractionDigits: 2,
          minimumIntegerDigits: 2,
          maximumIntegerDigits: 2,
          maximumSignificantDigits: 3,
          minimumSignificantDigits: 3,
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('12.00E3');
      });

      it('should be able to format an exponent number with exponent grouping(maximum digit specified)', function() {
        var number = formatNumber({
          type: 'floating',
          prefix: '',
          suffix: '',
          roundTo: 1,
          number: 12345,
          percentage: false,
          permille: false,
          currency: null,
          exponent: {
            digits: 1,
            plusSign: false
          },
          maximumFractionDigits: 4,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 1,
          maximumIntegerDigits: 3,
          maximumSignificantDigits: 3,
          minimumSignificantDigits: 3,
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('12.345E3');
      });

      it('should be able to format an exponent number with plus sign', function() {
        var number = formatNumber({
          type: 'floating',
          prefix: '',
          suffix: '',
          roundTo: 1,
          number: 100320,
          percentage: false,
          permille: false,
          currency: null,
          exponent: {
            digits: 1,
            plusSign: true
          },
          maximumFractionDigits: 3,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 1,
          maximumIntegerDigits: 3,
          maximumSignificantDigits: 3,
          minimumSignificantDigits: 3,
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('100.3E+3');
      });

      it('should be able to format an exponent number with negative exponent', function() {
        var number = formatNumber({
          type: 'floating',
          prefix: '',
          suffix: '',
          roundTo: 1,
          number: 0.0087,
          percentage: false,
          permille: false,
          currency: null,
          exponent: {
            digits: 1,
            plusSign: true
          },
          maximumFractionDigits: 1,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 1,
          maximumIntegerDigits: 1,
          maximumSignificantDigits: 3,
          minimumSignificantDigits: 3,
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('8.7E-3');
      });

      it('should be able to format an exponent number with specififed significant digits with input of a small fraction', function() {
        var number = formatNumber({
          type: 'significant',
          prefix: '',
          suffix: '',
          roundTo: 1,
          number: 0.0087,
          percentage: false,
          permille: false,
          currency: null,
          exponent: {
            digits: 1,
            plusSign: true
          },
          maximumFractionDigits: 1,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 1,
          maximumIntegerDigits: 1,
          maximumSignificantDigits: 2,
          minimumSignificantDigits: 2,
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('8.7E-3');
      });

      it('should be able to format an exponent number with specififed significant digits with inpu of a big integer', function() {
        var number = formatNumber({
          type: 'significant',
          prefix: '',
          suffix: '',
          roundTo: 1,
          number: 1123000,
          percentage: false,
          permille: false,
          currency: null,
          exponent: {
            digits: 1,
            plusSign: false
          },
          maximumFractionDigits: 1,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 1,
          maximumIntegerDigits: 1,
          maximumSignificantDigits: 3,
          minimumSignificantDigits: 1,
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('1.12E6');
      });

      it('should be able to format an exponent number with specififed significant digits by appending trailing zeros', function() {
        var number = formatNumber({
          type: 'significant',
          prefix: '',
          suffix: '',
          roundTo: 1,
          number: 0.00000087,
          percentage: false,
          permille: false,
          currency: null,
          exponent: {
            digits: 1,
            plusSign: true
          },
          maximumFractionDigits: 1,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 1,
          maximumIntegerDigits: 1,
          maximumSignificantDigits: 3,
          minimumSignificantDigits: 3,
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('8.70E-7');
      });

      it('should use the specified number of exponent digit before maximum integer digits', function() {
        var number = formatNumber({
          type: 'floating',
          prefix: '',
          suffix: '',
          roundTo: 1,
          number: 0.00000000087,
          percentage: false,
          permille: false,
          currency: null,
          exponent: {
            digits: 1,
            plusSign: true
          },
          maximumFractionDigits: 1,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 1,
          maximumIntegerDigits: 1,
          maximumSignificantDigits: 3,
          minimumSignificantDigits: 3,
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('0.87E-9');
        var number = formatNumber({
          type: 'floating',
          prefix: '',
          suffix: '',
          roundTo: 1,
          number: 87000000000,
          percentage: false,
          permille: false,
          currency: null,
          exponent: {
            digits: 1,
            plusSign: false
          },
          maximumFractionDigits: 1,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 1,
          maximumIntegerDigits: 1,
          maximumSignificantDigits: 3,
          minimumSignificantDigits: 3,
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('87E9');
      });

      it('should be able to format an exponent number with specififed significant digits by appending trailing zeros', function() {
        var number = formatNumber({
          type: 'significant',
          prefix: '',
          suffix: '',
          roundTo: 1,
          number: 0.00000087,
          percentage: false,
          permille: false,
          currency: null,
          exponent: {
            digits: 1,
            plusSign: true
          },
          maximumFractionDigits: 1,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 1,
          maximumIntegerDigits: 1,
          maximumSignificantDigits: 3,
          minimumSignificantDigits: 3,
          groupSize: {
            primary: 3,
            secondary: 2
          },
          symbols: symbols
        });
        expect(number).to.equal('8.70E-7');
      });

      it('should be able to format a significant number with padding character', function() {
        var number = formatNumber({
          type: 'significant',
          prefix: '$*#',
          suffix: '',
          roundTo: 1,
          number: 0.00000087,
          percentage: false,
          permille: false,
          currency: null,
          exponent: {
            digits: 1,
            plusSign: true
          },
          maximumFractionDigits: 1,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 1,
          maximumIntegerDigits: 1,
          maximumSignificantDigits: 3,
          minimumSignificantDigits: 3,
          groupSize: {
            primary: 3,
            secondary: 2
          },
          patternLength: 10,
          paddingCharacter: '#',
          symbols: symbols
        });
        expect(number).to.equal('$##8.70E-7');
      });

      it('should be able to format a floating number with padding character', function() {
        var number = formatNumber({
          type: 'floating',
          prefix: '*#',
          suffix: '',
          roundTo: 1,
          number: 1200,
          percentage: false,
          permille: false,
          currency: null,
          exponent: null,
          maximumFractionDigits: 2,
          minimumFractionDigits: 0,
          minimumIntegerDigits: 2,
          maximumIntegerDigits: 2,
          maximumSignificantDigits: 3,
          minimumSignificantDigits: 3,
          groupSize: {
            primary: 3,
            secondary: 2
          },
          patternLength: 10,
          paddingCharacter: '#',
          symbols: symbols
        });
        expect(number).to.equal('#####1,200');
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

    it('should be able to compile with a SelectordinalFormat in sub message', function(done) {
      var localizations = getLocalizations('{variable1, choice, 1<{variable2, selectordinal, one {message1} other {message2}}|3#message3}')
        , dependencies = getDependencies(localizations)
        , compiler = proxyquire('../plugins/javascript/compiler', dependencies);

      compiler.run();
      eventually(function() {
        var functionBody =
        'var string = \'\';\n' +
        'if(isNaN(parseFloat(it.variable1)) || it.variable1 <= 1 || it.variable1 > 1 && it.variable1 < 3) {\n' +
        '  var _case;\n' +
        '  _case = localizations[\'en-US\'].__getOrdinalKeyword(it.variable2);\n' +
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
        '    string += formatNumber({\n' +
        '      number: it.variable1 - 1,\n' +
        '      roundTo: 1,\n' +
        '      prefix: \'\',\n' +
        '      suffix: \'\',\n' +
        '      percentage: null,\n' +
        '      permille: null,\n' +
        '      currency: null,\n' +
        '      groupSize: {\n' +
        '        primary: 3,\n' +
        '        secondary: 3\n' +
        '      },\n' +
        '      minimumIntegerDigits: 1,\n' +
        '      minimumFractionDigits: 0,\n' +
        '      maximumFractionDigits: 0,\n' +
        '      symbols: localizations[\'en-US\'].__numberSymbols\n' +
        '    });\n' +
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

    it('should be able to compile with a plural remaining in sub message without offset', function(done) {
      var localizations = getLocalizations('{variable1, plural, one{sentence1{variable2}} other{# sentence2}}')
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
        '    string += formatNumber({\n' +
        '      number: it.variable1 - 0,\n' +
        '      roundTo: 1,\n' +
        '      prefix: \'\',\n' +
        '      suffix: \'\',\n' +
        '      percentage: null,\n' +
        '      permille: null,\n' +
        '      currency: null,\n' +
        '      groupSize: {\n' +
        '        primary: 3,\n' +
        '        secondary: 3\n' +
        '      },\n' +
        '      minimumIntegerDigits: 1,\n' +
        '      minimumFractionDigits: 0,\n' +
        '      maximumFractionDigits: 0,\n' +
        '      symbols: localizations[\'en-US\'].__numberSymbols\n' +
        '    });\n' +
        '    string += \' sentence2\';\n' +
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

    it('should be able to compile with a SelectordinalFormat in sub message', function(done) {
      var localizations = getLocalizations('{variable1, plural, one {{variable2, selectordinal, one {message1} other {message2}}} other {message3}}')
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
        '    _case = localizations[\'en-US\'].__getOrdinalKeyword(it.variable2);\n' +
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

    it('should be able to compile with a SelectordinalFormat in sub message', function(done) {
      var localizations = getLocalizations('{variable1, select, case1 {{variable2, selectordinal, one {message1} other {message2}}} other {message3}}')
        , dependencies = getDependencies(localizations)
        , compiler = proxyquire('../plugins/javascript/compiler', dependencies);

      compiler.run();
      eventually(function() {
        var functionBody =
        'var string = \'\';\n' +
        'switch(it.variable1) {\n' +
        '  case \'case1\':\n' +
        '    var _case;\n' +
        '    _case = localizations[\'en-US\'].__getOrdinalKeyword(it.variable2);\n' +
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

  describe('SelectordinalFormat', function() {
    it('should be able to compile with a single case', function(done) {
      var localizations = getLocalizations('{variable1, selectordinal, other{message1}}')
        , dependencies = getDependencies(localizations)
        , compiler = proxyquire('../plugins/javascript/compiler', dependencies);

      compiler.run();
      eventually(function() {
        var functionBody =
        'var string = \'\';\n' +
        'var _case;\n' +
        '_case = localizations[\'en-US\'].__getOrdinalKeyword(it.variable1);\n' +
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

    it('should be able to compile multiple cases', function(done) {
      var localizations = getLocalizations('{variable1, selectordinal, one {message1} other {message2}}')
        , dependencies = getDependencies(localizations)
        , compiler = proxyquire('../plugins/javascript/compiler', dependencies);

      compiler.run();
      eventually(function() {
        var functionBody =
        'var string = \'\';\n' +
        'var _case;\n' +
        '_case = localizations[\'en-US\'].__getOrdinalKeyword(it.variable1);\n' +
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
      var localizations = getLocalizations('{variable1, selectordinal, one {{variable2}} other {message3}}')
        , dependencies = getDependencies(localizations)
        , compiler = proxyquire('../plugins/javascript/compiler', dependencies);

      compiler.run();
      eventually(function() {
        var functionBody =
        'var string = \'\';\n' +
        'var _case;\n' +
        '_case = localizations[\'en-US\'].__getOrdinalKeyword(it.variable1);\n' +
        'switch(_case) {\n' +
        '  case \'one\':\n' +
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
      var localizations = getLocalizations('{variable1, selectordinal, one {sentence1{variable2}} other {message3}}')
        , dependencies = getDependencies(localizations)
        , compiler = proxyquire('../plugins/javascript/compiler', dependencies);

      compiler.run();
      eventually(function() {
        var functionBody =
        'var string = \'\';\n' +
        'var _case;\n' +
        '_case = localizations[\'en-US\'].__getOrdinalKeyword(it.variable1);\n' +
        'switch(_case) {\n' +
        '  case \'one\':\n' +
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
      var localizations = getLocalizations('{variable1, selectordinal, one {{variable2, choice, 1<message1|2#message2}} other {message3}}')
        , dependencies = getDependencies(localizations)
        , compiler = proxyquire('../plugins/javascript/compiler', dependencies);

      compiler.run();
      eventually(function() {
        var functionBody =
        'var string = \'\';\n' +
        'var _case;\n' +
        '_case = localizations[\'en-US\'].__getOrdinalKeyword(it.variable1);\n' +
        'switch(_case) {\n' +
        '  case \'one\':\n' +
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
      var localizations = getLocalizations('{variable1, selectordinal, one {{variable2, select, case1 {message1} other {message2}}} other {message3}}')
        , dependencies = getDependencies(localizations)
        , compiler = proxyquire('../plugins/javascript/compiler', dependencies);

      compiler.run();
      eventually(function() {
        var functionBody =
        'var string = \'\';\n' +
        'var _case;\n' +
        '_case = localizations[\'en-US\'].__getOrdinalKeyword(it.variable1);\n' +
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

    it('should be able to compile with a PluralFormat in sub message', function(done) {
      var localizations = getLocalizations('{variable1, selectordinal, one {{variable2, plural, one {message1} other {message2}}} other {message3}}')
        , dependencies = getDependencies(localizations)
        , compiler = proxyquire('../plugins/javascript/compiler', dependencies);

      compiler.run();
      eventually(function() {
        var functionBody =
        'var string = \'\';\n' +
        'var _case;\n' +
        '_case = localizations[\'en-US\'].__getOrdinalKeyword(it.variable1);\n' +
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

    it('should be able to compile with a SelectordinalFormat in sub message', function(done) {
      var localizations = getLocalizations('{variable1, selectordinal, one {{variable2, selectordinal, one {message1} other {message2}}} other {message3}}')
        , dependencies = getDependencies(localizations)
        , compiler = proxyquire('../plugins/javascript/compiler', dependencies);

      compiler.run();
      eventually(function() {
        var functionBody =
        'var string = \'\';\n' +
        'var _case;\n' +
        '_case = localizations[\'en-US\'].__getOrdinalKeyword(it.variable1);\n' +
        'switch(_case) {\n' +
        '  case \'one\':\n' +
        '    var _case;\n' +
        '    _case = localizations[\'en-US\'].__getOrdinalKeyword(it.variable2);\n' +
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
