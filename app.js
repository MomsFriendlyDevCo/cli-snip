#!/usr/bin/env node

/**
* Nicer version of `cut` thats not a c**t to use
*/

var fs = require('fs');
var program = require('commander');
var commanderExtras = require('commander-extras');
var readline = require('readline');
var textToRange = require('text-to-range').textToRange;

program
	.version(require('./package.json').version)
	.usage('[-f fields] [-d delimiter]')
	.option('-d, --delimiter [chars]', 'Specify the column delimiter', '/[\t\s,]/')
	.option('-f, --fields [field-list]', 'Specify the fields to output (default is \'*\')', '*')
	.option('-u, --undefined [string]', 'What to output when a field value cannot be found or is falsy (default is an empty string)', '')
	.option('-j, --output-delimiter [string]', 'Delimiter to use between output fields (default is a space)', ' ')
	.option('-v, --verbose', 'Output debugging information')
	.option('--max [number]', 'Specify the highest field index to use when using higher-than ranged fields (e.g. ">3")')
	.note('If delimiter is surrounded by "/" marks its parsed as a RegExp')
	.note('The default delimiter is any space, tab or comma - \'/[\\s\\t,]/\'')
	.note('Field ranges can be of the form: X X..Y X-Y X~Y <X <=X >X >=X')
	.note('Input files can be read from specified files or from STDIN if non are specified')
	.example('snip -d, -f1 <input', 'Parse input as a CSV and output only the first field')
	.example('snip -d \'/\s/\' -f1,2,5-9 <input', 'Cut up input using any space character (as a RegExp) and output fields 1, 2 and 5 to 9')
	.parse(process.argv);

// die() - Kill the process with an error {{{
var die = msg => {
	console.warn(msg);
	process.exit(1);
}
// }}}

// Parse delimiter into a RegExp for splitting {{{
program.delimiterRE =
	/^\/.*\/$/.test(program.delimiter) // Encased in '/'s?
		? new RegExp(program.delimiter.substr(1, program.delimiter.length -2))
		: new RegExp(program.delimiter.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')) // Flatten simple string into a RegExp

if (program.verbose) console.warn('Using split RegExp', program.delimiterRE.toString());
// }}}

// Parse range into an array of items we will output {{{
try {
	if (program.fields == '*') {
		if (program.verbose) console.warn('Outputting all fields');
	} else {
		var range = textToRange(program.fields);

		program.fieldArray = (range.or || [range])
			.reduce((t, i) => {
				if (i.max === Infinity) {
					if (!program.max) die('When using higher-than ranges (e.g. ">2") `--max [number]` must also be specified');
					i.max = parseInt(program.max);
				}
				if (i.min === -Infinity) i.min = 1;

				if (!isFinite(i.min) || !isFinite(i.max)) throw new Error(`Range items must be finite integers. Asked to parse ${i.min} to ${i.max}`);

				for (var n = Math.floor(i.min); n < Math.ceil(i.max + 1); n++)
					t.push(n - 1);
				return t;
			}, [])

		if (program.verbose) console.warn('Extracting fields', program.fieldArray.join(', '));
	}
} catch (e) {
	die('Invalid --fields specification', e ? '-' + e.toString() : '');
}
// }}}

// Function to handle line input
var lineProcess = line => {
	var lineBits = line.split(program.delimiterRE);

	console.log(
		(
			program.fields == '*'
				? lineBits
				: program.fieldArray.map(field =>
					lineBits[field] || program.undefined
				)
		)
		.join(program.outputDelimiter)
	)
};

// Function to handle end of input
var rlClose = index => {
	lineReaders[index].closed = true;
	if (lineReaders.every(lr => lr.closed)) {
		if (program.verbose) console.warn('End of input - closing');
		process.exit(0);
	} else if (program.verbose) {
		console.warn('Still waiting on inputs', lineReaders.map((lr, index) => [index, lr]).filter(lr => !lr[1].closed).map(lr => lr[0]).join(', '), 'to close');
	}
};

// Array of readline interfaces to read from
var lineReaders =
	program.args.length
		?  program.args.map((path, pathIndex) => // File paths given, read from them
			readline.createInterface({
				input: fs.createReadStream(path),
				output: process.stdout,
				terminal: false,
			})
				.on('line', lineProcess)
				.on('close', ()=> rlClose(pathIndex))
		)
		: [ // No files given - Read from STDIN
			readline.createInterface({
				input: process.stdin,
			})
				.on('line', lineProcess)
				.on('close', ()=> rlClose(0))
		];

