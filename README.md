# JsSCSS

A Javascript-based Sass/SCSS interpreter

## Getting Started

JsSCSS is a client-side Sass/SCSS compiler. Being client-side, it can do a lot of stuff that a server-side SCSS compiler cannot. But it has it's own limitations too.
Some of the advantages are:
1. Changes to SCSS files automatically appear in the compiled CSS (no need for a watcher)
2. You can dynamically insert, compile and delete SCSS code using Javascript.
3. Code minification is an included feature
4. Better collaboration of CSS with Javascript
5. It can evaluate SCSS expressions involving px and % together (support yet to be included)

Some of the disadvantages are:
1. Page may flicker upon initial load because compiling the SCSS takes some time
2. CPU usage of end-user may increase

For a hands-on experience of it's working, go to [docs](http://mskies.web44.net/jsass/index.html).

Currently it supports:

- SCSS syntax, not exactly Sass syntax (Semi-colons at end of statements and braces, where required, are a must)
- Sass variables (except Maps)
- @extend directive
- @mixin
- Nested CSS Selectors
- Code minification

I am planning to add:

[] Improved @import support
[] Conditional directives
[] Maps and basic map functions
[] SCSS expressions

This is an Open Source Project. Any help is gratefully accepted.

This is my first Open Source Project and first Project published on GitHub. Suggestions, corrections and advices are welcome.

### Prerequisites

JsSCSS requires JQuery 3.2.1 to be included. Copy and paste the following lines into your web file before including JsSCSS

```
<script src="https://code.jquery.com/jquery-3.2.1.min.js" crossorigin="anonymous"></script>
```

### Installing

You can download the current state of code as a js file [here](http://mskies.web44.net/jsscss/jsscss.js)

To include it in your HTML file you can use the script tag as follows:
```
<script src="jsscss.js"></script>
```

Currently, JsSCSS can compile SCSS code from 3 sources:

####From SASS file

To compile and include SCSS code from a file, name it in the format [your-file-name].sass and then in your web page using:

```
JsSCSS.load("[your-file-name].sass");
```

For files located in other directories, you can use the relative URL of the file with respect to the actual calling web page
For instance, to load a file with the url *css/styles.sass* into your *index.html* located in the root, you can use the following code in your *index.html*:

```
JsSCSS.load("css/styles.sass");
```

####From Inline SCSS Code
JsSCSS supports a special inline SCSS code. Wrap up your SCSS code inside a ```<code type="sass"></code>``` block. For instance:

```
<code type="sass">
	.update{
		color: green;
		ul{
			color: $uc;
			li{
				list-style-type: square;
			}
		}
	}
	pre{
		font-family: Arial,Helvetica;
	}
	a{
		cursor:pointer;
	}
</code>
```

The above code can then be compiled using the following line of Javascript code:

```
JsSCSS.compileInline();
```

Basically, it compiles all SCSS code within all code blocks (such as the previous) found in the entire document.

####From source SCSS as String

For more grip over your CSS, you can also compile an SCSS code as a string and get CSS as an output String.
For example, if I have the following Javascript string:
```
var code = " \
body{ \
	background-color: yellow; \
		p{ \
			padding: 10px; \
		} \
	} \
";
```
Then I can compile it with JsSCSS by using the **compile()** function as follows:
```
var css = JsSCSS.compile(code);
console.log(css);
/*
Output to console:

body p{padding: 10px}body{background-color:yellow}

*/
```

For more advanced controls over your SCSS code, see the Advanced section below.

##Advanced Functions

The JsSCSS compiler uses the following methods to compile the code:
1. tokenize() - tokenizes code into segments for better understanding of structure
2. lexer() - converts basic tokens to Abstract Syntax Tree format, separating variables, imports and mixins from the actual code
3. parse() - parses the Abstract Syntax Tree into usable CSS code, substituting variables, evaluating includes and so on.
4. compileInternal() - recursively compiles the parsed syntax tree from parse() function into includable CSS code

You can use any of the above functions separately to get/use the respective outputs.
I hope the [source code](http://mskies.web44.net/jsass/jsass.js) and included comments will suffice to explain each of these functions to all viewers.
If not, you can always contact me or leave an email.

## Deployment

This project is NOT YET PRODUCTION-READY

## Built With

* [JQuery](https://github.com/jquery/jquery) - The javascript library used

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/) for details on our code of conduct, and the process for submitting pull requests to us.

## Authors

* **Sagnik Modak** - *Initial Author and currently working on project* - [JsSCSS](https://github.com/JsSCSS/)

See also the list of [contributors](https://github.com/JsSCSS/contributors) who participated in this project.

## License

This project is licensed under the GNU AFFERO GENERAL PUBLIC LICENSE - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* The function from [this](https://stackoverflow.com/a/5582719/7533368) StackOverflow Answer really helped me
* [This](https://medium.com/@kosamari/how-to-be-a-compiler-make-a-compiler-with-javascript-4a8a13d473b4) Medium post was a source of inspiration
* Thanks to my friends for being supportive
