@MomsFriendlyDevCo/CLI-Snip
===========================
A less irritating version of the GNU `cut` utility.

**Features:**

* Automatically uses a delimiter which cuts via spaces, tabs and commas
* RegExp compatible delimiters
* Can support complex field specifications - `* X X..Y X-Y X~Y <X <=X >X >=X`
* (Mostly) backwards compatible with the regular `cut` command
* `--verbose` mode to see what the tool is actually doing


Installation
------------
Install via NPM in the usual way:

```
npm i -g @momsfriendlydevco/cli-snip
```

(You may need a `sudo` prefix depending on your Node setup)


Usage
-----

```
Usage: snip [-f fields] [-d delimiter]

Options:
  -V, --version                    output the version number
  -d, --delimiter [chars]          Specify the column delimiter (default:
                                   "/[\ts,]/")
  -f, --fields [field-list]        Specify the fields to output (default is
                                   '*') (default: "*")
  -u, --undefined [string]         What to output when a field value cannot be
                                   found or is falsy (default is an empty
                                   string) (default: "")
  -j, --output-delimiter [string]  Delimiter to use between output fields
                                   (default is a space) (default: " ")
  -v, --verbose                    Output debugging information
  --max [number]                   Specify the highest field index to use when
                                   using higher-than ranged fields (e.g. ">3")
  -h, --help                       output usage information

Notes:
  * If delimiter is surrounded by "/" marks its parsed as a RegExp
  * The default delimiter is any space, tab or comma - '/[\s\t,]/'
  * Field ranges can be of the form: X X..Y X-Y X~Y <X <=X >X >=X
  * Input files can be read from specified files or from STDIN if non are specified

Examples:

  # Parse input as a CSV and output only the first field
  snip -d, -f1 <input

  # Cut up input using any space character (as a RegExp) and output fields 1, 2 and 5 to 9
  snip -d '/s/' -f1,2,5-9 <input
```
