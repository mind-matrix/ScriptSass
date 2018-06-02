# ScriptSass
<p align="center">
<img src="scriptsass.png" width="250" />
</p>
A Javascript-based Sass/SCSS interpreter

## Getting Started

ScriptSass is a client-side Sass/SCSS compiler. Being client-side, it can do a lot of stuff that a server-side SCSS compiler cannot. But it has it's own limitations too.
Some of the advantages are:
1. Changes to SCSS files automatically appear in the compiled CSS (no need for a watcher)
2. You can dynamically insert, compile and delete SCSS code using Javascript.
3. Code minification is an included feature
4. Better collaboration of CSS with Javascript
5. It can also evaluate SCSS expressions involving px and % together.

Some of the disadvantages are:
1. Page may flicker upon initial load because compiling the SCSS takes some time (see [best practices](#best_practices))
2. CPU usage of end-user may increase

The big takeaway - it's still only 11 kB (minified)
For a hands-on experience of it's working, go to [docs](http://staying.me/scriptsass/index.html).

Currently it supports:

- SCSS syntax, not exactly Sass syntax (Semi-colons at end of statements and braces, where required, are a must)
- Sass variables (except Maps)
- @import and @extend directives
- @mixin
- Nested CSS Selectors
- Code minification
- Inline SCSS

I am planning to add:

- [x] Improved @import support
- [ ] Conditional directives
- [ ] Maps and basic map functions
- [x] SCSS expressions

This is an Open Source Project. Any help is gratefully accepted.

This is my first Open Source Project and first Project published on GitHub. Suggestions, corrections and advices are welcome.

### Prerequisites

ScriptSass requires JQuery 3.2.1 to be included. Copy and paste the following lines into your web file before including ScriptSass

```HTML
<script src="https://code.jquery.com/jquery-3.2.1.min.js" crossorigin="anonymous"></script>
```

### Installing

You can download the current state of code as a js file [here](http://mskies.web44.net/scriptsass/scriptsass.current.js)

To include it in your HTML file you can use the script tag as follows:
```HTML
<script src="scriptsass.js"></script>
```

Currently, ScriptSass can compile SCSS code from 3 sources:

#### From SASS file

To compile and include SCSS code from a file, name it in the format [your-file-name].sass and then in your web page using:

```JavaScript
ScriptSass.load("[your-file-name].sass");
```

For files located in other directories, you can use the relative URL of the file with respect to the actual calling web page
For instance, to load a file with the url *css/styles.sass* into your *index.html* located in the root, you can use the following code in your *index.html*:

```
ScriptSass.load("css/styles.sass");
```

#### From Inline SCSS Code

ScriptSass supports inline SCSS code blocks. Wrap up your SCSS code inside a ```<code type="sass"></code>``` block. For instance:

```HTML
<code type="sass">
	$uc: #ffe68c;
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

```JavaScript
ScriptSass.compileInline();
```

Basically, it compiles all SCSS code within all code blocks (such as the previous) found in the entire document.

With the latest update, ScriptSass now supports more than just inline code blocks. *It supports in-element codes too!*

##### Computed style properties

ScriptSass can compile inline style properties too. For example, say we have the above code block and an element, say a div as follows :

```HTML
<div id="exampleDiv" class="scss" style="color:$uc">
 <!--content here-->
</div>
```
Now the variable $uc is defined in the code block. But we can use this in here too! Notice that we have added the ```class="scss"``` to the div. Without that,
ScriptSass would not compile it. However, if we want ScriptSass to compile all style elements anywhere on the page, even without the special *.scc* class, we
need to do the following modification to our **compileInline()** function :
```JavaScript
ScriptSass.compileInline(true);
```

Simple, right? Basically, it sets the internal *inlineUnrestricted* flag to true and hence compiles everything.

**NOTE:** We can do the same for mixins too! Simply define a mixin in any sass code block as above and then call it inside a style element.

#### From source SCSS as String

For more grip over your CSS, you can also compile an SCSS code as a string and get CSS as an output String.
For example, if I have the following Javascript string:
```JavaScript
var code = " \
body{ \
	background-color: yellow; \
		p{ \
			padding: 10px; \
		} \
	} \
";
```
Then I can compile it with ScriptSass by using the **compile()** function as follows:
```JavaScript
var css = ScriptSass.compile(code);
console.log(css);
/*
Output to console:

body p{padding: 10px}body{background-color:yellow}

*/
```

For more advanced controls over your SCSS code, see the Advanced section below.

## Advanced Functions

The ScriptSass compiler uses the following methods to compile the code:
1. **tokenize()** - tokenizes code into segments for better understanding of structure
2. **lexer()** - converts basic tokens to Abstract Syntax Tree format, separating variables, imports and mixins from the actual code
3. **parse()** - parses the Abstract Syntax Tree into usable CSS code, substituting variables, evaluating includes and so on.
4. **compileInternal()** - recursively compiles the parsed syntax tree from parse() function into includable CSS code

You can use any of the above functions separately to get/use the respective outputs.
I hope the [source code](http://mskies.web44.net/scriptsass/scriptsass.current.js) and included comments will suffice to explain each of these functions to all viewers.
If not, you can always contact me or leave an email.

<a name="best_practices">

## Best Practices

Since SassScript compiles SCSS code on the client-side and it takes some time, the page may flicker on initial load. To fix this, it is best to add a preloader to the web page 
and show the contents only after compilation is done. To make things easier, I have included a ```loader.css``` file in the repository. This file has been specifically compiled 
using **Materialize.css** for a custom spinner preloader. But you can also use your own preloader. To use this, add the stylesheet to the head section of your web page and then 
add the spinner code. An example usage case would be :

```HTML
<!DOCTYPE html>
<html lang="en">
<head>
 <title>SassScript with Preloader</title>
 
 <meta charset="utf-8" />
 <meta name="viewport" content="width=device-width"/>
 <meta name="web_author" content="Sagnik Modak" />
 <meta name="language" CONTENT="ES" />
 
 <link rel="stylesheet" href="loader.css" />
</head>
<body>
/* Preloader Code */ 
 <div class="loader-overlay">
  <div class="preloader-wrapper big active loader">
   <div class="spinner-layer spinner-blue-only">
    <div class="circle-clipper left">
    <div class="circle"></div>
    </div><div class="gap-patch">
    <div class="circle"></div>
    </div><div class="circle-clipper right">
    <div class="circle"></div>
    </div>
   </div>
  </div>
 </div>
 
/* Your content */

/* Scripts */
 <script src="jquery-3.2.1.min.js"></script>
 <script src="scriptsass.js"></script>
 <script>
 
  $(document).ready(function (){
  
	  ScriptSass.compileInline().done(function (){ // Compile the Inline SCSS Codes. You can do the same for the load() function too
	  
		  $('.loader-overlay').fadeOut(500); // Fade Out Loader and Overlay once compilation is done 
		  
	  });
	  
  });
  
 </script>
</body>
</html>
```
</a>

## Deployment

This project is NOT YET PRODUCTION-READY

## Built With

* [JQuery](https://github.com/jquery/jquery) - The javascript library used

## Contributing

As I am quite new to Github, I would appreciate some help in creating a CONTRIBUTING.md file with guidelines on how to contribute.

## Authors

* **Sagnik Modak** - *Initial Author and currently working on project* - [ScriptSass](https://github.com/ScriptSass/)

See also the list of [contributors](https://github.com/ScriptSass/contributors) who participated in this project.

## License

This project is licensed under the GNU AFFERO GENERAL PUBLIC LICENSE - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* The function from [this](https://stackoverflow.com/a/5582719/7533368) StackOverflow Answer really helped me
* [This](https://medium.com/@kosamari/how-to-be-a-compiler-make-a-compiler-with-javascript-4a8a13d473b4) Medium post was a source of inspiration
* Thanks to my friends for being supportive
* I have used some [MaterializeCSS](https://materializecss.com/) components
