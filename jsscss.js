/*
JsSCSS - A Javascript SCSS compiler

Copyright (C) 2017  Sagnik Modak

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
	

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Contact Me:

Phone: +919774817655
E-mail: sagnikmodak1118@gmail.com

*/

function splitWithTail(str,delim,count){
  var parts = str.split(delim);
  var tail = parts.slice(count).join(delim);
  var result = parts.slice(0,count);
  result.push(tail);
  return result;
}

var JsSCSS = new Object();
JsSCSS.inString = function(i,arr){
					var j;
					var inString = 2;
					for(j=0;j<i;j++){
						if(arr[j].indexOf("\"") > -1)
							inString++;
					}
					return (inString%2 == 0)?true:false;
	};
JsSCSS.findClosure = function(arr,i){
					var j;
					var go = 0;
					for(j=i+1;j<arr.length;j++){
						if(arr[j] == "{")
							go++;
						if(arr[j] == "}" && go > 0)
							go--;
						if(arr[j] == "}" && go == 0)
							break;
					}
					return j;
	};
	
JsSCSS.isProperty = function(v){
							var pattern = new RegExp("^[^\$:].+$");
							if(pattern.test(v) && v.indexOf(":") > -1){
								return true;
							}
							return false;
	};

JsSCSS.replaceVars = function(str,vars){
						var i;
						var parts = str.split(/([:\s])+/g);
						for(i=0;i<parts.length;i++){
							if(parts[i].startsWith("$") && vars.hasOwnProperty(parts[i]))
								parts[i] = vars[parts[i]].data;
						}
						return parts.join("");
};
	
JsSCSS.replacePlaceholder = function(name,parentstr){
							if(name.indexOf("&") > -1){
								parentstr = parentstr.trim();
								var pstr = parentstr.split(" ");
								var p = pstr.pop();
								pstr = pstr.join(" ")+" ";
								return (pstr+name.replace(/[&]/g, p)).trim();
							}else
								return (parentstr+name).trim();
};
JsSCSS.tokenize = function(rawcode,parentstr=""){
		var par = parentstr;
		var code = rawcode.replace(/[^\x20-\x7E]/gmi, "").split('"').map(function(v,i){
				if(i%2){
					return v;
					//do nothing;
				}else{
					var parts = v.split(/([{};])/g);
					for(i = 0; i < parts.length; i++){
					parts[i] = parts[i].trim();
					if(!parts[i].startsWith("@")){
						var colindex = parts[i].indexOf(":");
						if(colindex > -1){
							parts[i] = parts[i].substring(0,colindex+1) + parts[i].substring(colindex+1,parts[i].length).trim();
						}else{
							parts[i] = parts[i].replace(/\s/g, "");
						}
					}
					}
					v = parts.join('');
				}
					return v;
			}).join('"');
		var tokens = code.split(/([{};])/g);
		tokens = tokens.map(function (v,i,arr){
			if(v.startsWith("@")){
				if(v.startsWith("@import")){
					var url = splitWithTail(v," ",1)[1].replace(/^"(.*)"$/, '$1');
					return {type:"import",data:url};
				}
				if(v.startsWith("@extend")){
					var selector = splitWithTail(v," ",1)[1].replace(/^"(.*)"$/, '$1');
					return {type:"extend",data:selector};
				}
				if(v.startsWith("@mixin")){
					var func_def = splitWithTail(v," ",1)[1];
					var func_name = func_def.substring(0,func_def.indexOf("("));
					var func_var_list = func_def.substring(func_def.indexOf("(")+1,func_def.indexOf(")")).split(",");
					for(k=0;k<func_var_list.length;k++)
						func_var_list[k] = func_var_list[k].trim();
					var func_body = arr.slice(i+2,JsSCSS.findClosure(arr,i)).join('');
					var closure = JsSCSS.findClosure(arr,i+1) - i;
					arr.splice(i+1,closure);
					return {type:"mixin",data:{name:func_name,params:func_var_list,data:JsSCSS.tokenize(func_body,par)}};
				}
				if(v.startsWith("@include")){
					var inc_def = splitWithTail(v," ",1)[1];
					var inc_name = inc_def.substring(0,inc_def.indexOf("("));
					var inc_params = inc_def.substring(inc_def.indexOf("(")+1,inc_def.indexOf(")")).split(",");
					for(k=0;k<inc_params.length;k++)
						inc_params[k] = inc_params[k].trim();
					return {type:"include",name:inc_name,params:inc_params};
				}
			}
			if(JsSCSS.isProperty(v) && (arr[i+1] == ";" || i == arr.length-1)){
				var prop_def = splitWithTail(v,":",1);
				var prop_name = prop_def[0];
				var prop_data = prop_def[1];
				return {type:"property",data:{name:prop_name,data:prop_data}};
			}
			if(arr[i+1] == "{"){
				var sel_name = v;
				var sel_body = arr.slice(i+2,JsSCSS.findClosure(arr,i)).join('');
				var closure = JsSCSS.findClosure(arr,i+1) - i;
				arr.splice(i+1,closure);
				var pstr = par+sel_name+" ";
				return {type:"selector",data:{name:sel_name,data:JsSCSS.tokenize(sel_body,pstr)},parent_string:par};
			}
			if(v.startsWith("$")){
					var var_def = splitWithTail(v,":",1);
					var var_name = var_def[0];
					var var_data = var_def[1];
					var var_type;
					if(!isNaN(var_data)){
						var_type = "number";
					}else{
						if(var_data.startsWith("(") && var_data.endsWith(")"))
							var_type = "map";
						else
							var_type = "expression";
					}
					if(var_type == "map"){
						var_data.replace(/[\(\)]/g,"");
						var pairs = var_data.split(",");
						var map = [];
						var pair,key,val;
						for(k=0;k<pairs.length;k++){
							pair = pairs[k].split(":");
							key = pair[0];
							val = pair[1];
							map[key] = val;
						}
						var_data = map;
					}
					return {type:"variable",data:{name:var_name,type:var_type,data:var_data}};
			}
			return v;
		}).filter(function (v){
			return (typeof v == "object");
		});
		return tokens;
};
JsSCSS.lexer = function (tk,sel_list = [],flag = 0,varlist = {},mixlist = {}){
	var i;
	var vars = varlist;
	var mixins = mixlist;
	var imports = [];
	var data = [];
	
		for(i=0;i<tk.length;i++){
			if(typeof tk[i] == "object"){
				if(tk[i].type == "variable"){
					vars[tk[i].data.name] = {type:tk[i].data.type,data:tk[i].data.data};
					tk.splice(i,1);
					i--;
					continue;
				}
				if(tk[i].type == "mixin"){
					mixins[tk[i].data.name] = {params:tk[i].data.params,data:tk[i].data.data};
					tk.splice(i,1);
					i--;
					continue;
				}
				if(tk[i].type == "import"){
					imports.push(tk[i].data);
					tk.splice(i,1);
					i--;
					continue;
				}
				if(tk[i].type == "selector"){
					var sel = tk[i];
					tk.splice(i,1);
					i--;
					sel.data.data = JsSCSS.lexer(sel.data.data,sel_list,1);
					sel_list.push({"name":JsSCSS.replacePlaceholder(sel.data.name,sel.parent_string),data:sel.data.data});
					continue;
				}
				if(tk[i].type == "property"){
					data.push(tk[i]);
					tk.splice(i,1);
					i--;
					continue;
				}
				if(tk[i].type == "include"){
					data.push(tk[i]);
					tk.splice(i,1);
					i--;
					continue;
				}
			}
		}
	if(flag)	
		return {variables:vars,mixes:mixins,imports:imports,props:data};
	else
		return {variables:vars,mixes:mixins,imports:imports,selectors:sel_list};
};
JsSCSS.parse = function(ast){
				var i,j,k;
				//variable and include replacements
				if(ast.hasOwnProperty('selectors')){
					for(i=0;i<ast.selectors.length;i++){
						ast.selectors[i].name = JsSCSS.replaceVars(ast.selectors[i].name,ast.variables);
						for(j=0;j<ast.selectors[i].data.props.length;j++){
							if(ast.selectors[i].data.props[j].type == "property"){
								ast.selectors[i].data.props[j].data.name = JsSCSS.replaceVars(ast.selectors[i].data.props[j].data.name,ast.variables);
								for(var attr in ast.variables){
									if(!ast.selectors[i].data.variables.hasOwnProperty(attr))
										ast.selectors[i].data.variables[attr]=ast.variables[attr];
								}
								ast.selectors[i].data.props[j].data.data = JsSCSS.replaceVars(ast.selectors[i].data.props[j].data.data,ast.selectors[i].data.variables);
							}else if(ast.selectors[i].data.props[j].type == "include"){
								var params = ast.selectors[i].data.props[j].params;
								var fname = ast.selectors[i].data.props[j].name;
								ast.selectors[i].data.props.splice(j,1);
								j--;
								for(var attr in ast.mixes){
									if(!ast.selectors[i].data.mixes.hasOwnProperty(attr))
										ast.selectors[i].data.mixes[attr]=ast.mixes[attr];
								}
								var vlist={};
								for(k=0;k<ast.selectors[i].data.mixes[fname].params.length;k++){
									vlist[ast.selectors[i].data.mixes[fname].params[k]] = {type:"expression",data:params[k]};
								}
								var props = JsSCSS.parse(JsSCSS.lexer(ast.selectors[i].data.mixes[fname].data,[],1,vlist,ast.selectors[i].data.mixes)).props;
								ast.selectors[i].data.props = ast.selectors[i].data.props.concat(props);
							}
						}
					}
				}else if(ast.hasOwnProperty('props')){
					for(j=0;j<ast.props.length;j++){
							if(ast.props[j].type == "property"){
								ast.props[j].data.name = JsSCSS.replaceVars(ast.props[j].data.name,ast.variables);
								ast.props[j].data.data = JsSCSS.replaceVars(ast.props[j].data.data,ast.variables);
							}else if(ast.props[j].type == "include"){
								var params = ast.props[j].params;
								var fname = ast.props[j].name;
								ast.props.splice(j,1);
								j--;
								var vlist={};
								for(k=0;k<ast.mixes[fname].params.length;k++){
									vlist[ast.mixes[fname].params[k]] = {type:"expression",data:params[k]};
								}
								var props = JsSCSS.parse(JsSCSS.lexer(ast.selectors[i].data.mixes[fname].data,[],1,vlist,ast.mixes)).props;
								ast.props = ast.props.concat(props);
							}
						}
				}
				return ast;
};
JsSCSS.compileInternal = function(ast){
					var i;
					var css="";
					if(ast.hasOwnProperty('selectors')){
						for(i=0;i<ast.selectors.length;i++){
							css+=ast.selectors[i].name+"{"+JsSCSS.compileInternal(ast.selectors[i].data)+"}";
						}
					}else if(ast.hasOwnProperty('props')){
						for(i=0;i<ast.props.length;i++){
							if(ast.props[i].type == "property")
								css+=ast.props[i].data.name+":"+ast.props[i].data.data+";";
						}
					}
					return css;
};
JsSCSS.compile = function(code){
					return JsSCSS.compileInternal(JsSCSS.parse(JsSCSS.lexer(JsSCSS.tokenize(code))));
};
JsSCSS.compileInline = function(){
		$('code[type="sass"]').each(function (){
			$(this).hide();
			code = $(this).html();
			($('head').find('style').length > 0) ? $('head style').append(JsSCSS.compile(code)):$('head').append('<style>'+JsSCSS.compile(code)+'</style>');
		});
};
JsSCSS.load = function(file){
				var code="";
				$.ajax({
					url: file,
					success: function (response){
						code = response;
					},
					async: false
				});
				($('head').find('style').length > 0) ? $('head style').append(JsSCSS.compile(code)):$('head').append('<style>'+JsSCSS.compile(code)+'</style>');
};

example = JsSCSS.compile(' \
	@import test; \
	@mixin $cool($v1){ \
		padding: $v1; \
	} \
	$b: .black; \
	$g: 1px solid green ; \
	$b:active{ \
		@include $cool(10px); \
		background-color: black; \
		&:hover{ \
			border: $g; \
		} \
	} \
	header:hover{ \
		color: blue; \
	}'
	);
console.log(example);
