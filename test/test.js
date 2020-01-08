var expect = require('chai').expect;
var exec = require('@momsfriendlydevco/exec');

describe('should cut up text correctly', function() {
	this.timeout(5 * 1000);

	before('setup exec()', ()=> exec.defaults = {
		...exec.defaults,
		cwd: `${__dirname}/..`,
		logStderr: true,
		bufferStdout: true,
		pipe: false,
	});

	it('should parse text from a file', ()=>
		exec('node app.js -d, -f3 test/data/data.csv').then(res => {
			expect(res).to.equal('LastName\nRandom\nRandom\nEntropy\nChaos')
		})
	);

	it('should parse text from STDIN', ()=>
		exec('node app.js -f2', {
			stdin: 'one\ttwo\tthree',
		}).then(res => {
			expect(res).to.equal('two');
		})
	);

	it('should support RegExp splits', ()=>
		exec('node app.js -f1,3 -d/[XZ]/ -j,', {
			stdin: 'oneXtwoZthree',
		}).then(res => {
			expect(res).to.equal('one,three');
		})
	);

	it('should support complex ranges splits', ()=>
		exec('node app.js -f1-3,1,1..3,=2,<2,>3 --max 5', {
			stdin: 'one,two,three,four,five',
		}).then(res => {
			expect(res).to.equal('one,two,three,one,one,two,three,two,one,two,three,four');
		})
	);

});
