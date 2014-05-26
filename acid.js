/**
 * $ JS BETA.
 * @version 1.0
 * @author Thomas Marchi
 * @copyright 2014 Thomas Marchi
 * @LNKit.com
 * @email tom@lnkit.com
 */
 
"use strict";

function $(name, item, act) {
	//import scopes
	var proto=$.prototype,
		mem = proto.mem,
		s = proto.strng,
		is = s.is,
		has = s.has,
		hasvalue = s.hasvalue,
		s = null,
		toArray = proto.array.to,
		scope = proto.scope,
		dom = proto.dom,
		temp=proto.temp;
		
	if (name) {
		if (is(name)) {
			
			//temp storage
			if(!act){
				var isthere=temp[name];
				if(isthere){
					if (item == '!') {
						return isthere;
					}
					dom.obj = isthere;
					return dom;
				}
			}
			
			//jump to scope
			if (name.length == 1) {
				return scope(name);
			}
			
			//quick function access
			if(name[0] == '@'){
				return proto.find_fun(name.substring(1));
			}
			
			//mem access
			if(name[0] == '%'){
				if (hasvalue(item)) {
					if (item != '#') {
						mem[name.substring(1)] = item;
						var obj=item;
					}
				}
				if(!obj){
					var obj = proto.find_fun('mem.'+name.substring(1));
				}
				if (item == '#') {
					dom.obj=obj;
					return dom;
				}
				return obj;
			}
			
			//dom selection
			var obj=dom.select(name);
			if (!obj) {
				var obj = false;
			}else{
				if (obj.length == 1) {
					var obj = obj[0];
				}
				if(act){
					if (act == 'last') {
						var obj = obj[obj.length - 1];
					}
					if (typeof act === 'number') {
						var obj = obj[act];
					}
					proto.temp_clear(name+act);
					temp[name+act]=obj;
				}else{
					proto.temp_clear(name);
					temp[name]=obj;
				}
			}
			
			if (item == '!') {
				return obj;
			}
			
			dom.obj = obj;
			var obj = null,
				item = null,
				name = null;
			return dom;
		}
		
		if (name instanceof Array) {
			if (item == '#') {
				dom.obj = name;
				return dom;
			}
			if(item){
				return scope(item);
			}
			return dom;
		}
		
		if (dom.is(name)) {
			if (item && item != '#') {
				if (is(item)) {
					var name = dom.select(item,name);
					if (act == '!') {
						return name;
					}
				}
			}
			dom.obj = name;
			return dom;
		}
		
	}
	return proto;
}

$.prototype = {
temp:{},
	temp_clear:function(name){
		setTimeout(function() {
			$.prototype.temp[name]=null;
			name=null;
			return false;
		},10000);
		return false;
	},
	free: function(gc) { //clear a var(s) in mem
		if (gc instanceof Array) {
			var i = gc;
			while (i--) {
				$.prototype.mem[gc[i]] = 0;
			}
			return false;
		}
		$.prototype.mem[gc] = 0;
		return false;
	},
	symbol:{
		'@':function(){
			return $.prototype;
		},
		'#':function(){
			return $.prototype.dom;
		},
		'!':function(){
			return $.prototype.dom.obj;
		},
		'%':function(){
			return $.prototype.mem;
		},
		'$':function(){
			return $;
		},
	},
	find_fun:function(name){
		var has=$.prototype.strng.has;
		if (has(name, '.')) {
			var newname = name.split('.'),
				length = newname.length,
				obj = $.prototype[newname[0]];
			if(length>1){
				for (var i = 1; i < length; i++) {
					var obj = obj[newname[i]];
				}
			}
		} else {
			var obj = $.prototype[name];
		}
		return obj;
	},
	scope: function(scope) {
		if(scope.length==1){
			if(scope!='#' && scope!='!'){
				$.prototype.dom.obj = null;
			}
			var scope=$.prototype.symbol[scope]();
		}
		else {
			var scope = $.prototype.find_fun(scope.substring(1));
		}
		return scope;
	},
	dom: {
		select:function(select,context){
			var has=$.prototype.strng.has,
				toArray = $.prototype.array.to,
				select=select.trim(),
				space=has(select, " "),
				less=has(select, "<"),
				more=has(select, ">"),
				dot=has(select, "."),
				hash=has(select, "#"),
				bracket=has(select, "["),
				cls=false,
				id=false,
				dotnhash=false,
				multipledots=false;
			
			if(dot){
				var multipledots=select.split('.').length,
					cls=(select[0] == '.')? true : false;
				if(multipledots > 2){
					var multipledots=true;
				}else{
					if(cls){
						var multipledots=false;
					}else{
						var multipledots=true;
					}
				}
			}
			
			if(hash){
				var id=(select[0] == '#')? true : false;
				if(dot){
					var dotnhash=true;	
				}
			}
				
			if(!context){
				var context=document;
			}
			
			if (space || less || more || bracket || multipledots || dotnhash) {
				var obj = toArray(context.querySelectorAll(select));
			} else if (id) {
				var obj = context.getElementById(select.substring(1));
			} else if (cls) {
				var obj = toArray(context.getElementsByClassName(select.substring(1)));
			} else {
				var obj = toArray(context.getElementsByTagName(select));
			} 
			if(!obj){
				var obj=false;
			}
			var len=obj.length;
			if(len === 0){
				var obj=false;
			}
			return obj;	
		},
		obj: {},
		r: function() {
			return $.prototype.dom.obj || false;
		},
		exist:function(){
			var r=false,
			obj=$.prototype.dom.r();
			if(obj){
				if(obj instanceof Array){
					if(obj.length > 0){
						var r=true;
					}
				}else{
					var r=true;
				}
			}
			return r;	
		},
		is: function(obj) {
			if (obj.nodeType) {
				return true;
			}
			return false;
		},
		at: function(data) { // return classList obj
								
			data.obj=$.prototype.dom.r();
			
			var obj = $.prototype.dom.htmlobj_array(data);
			
			if (!data.scope) {
				$.prototype.dom.obj = null;
			}

			return (data.scope) ? $.prototype.scope(data.scope) : obj;
		},
		get: function(cls_obj, type, dir , noarray) { //return class objects
			var obj = $.prototype.dom.r()[type](cls_obj) || false;
			if(!noarray){
				var obj = $.prototype.array.to(obj);
			}
			$.prototype.dom.obj = obj;
			return (!dir) ? $.prototype.dom : $.prototype.scope(dir);
		},
		cls: function(obj, dir) { //return class objects
			return $.prototype.dom.get(obj, 'getElementsByClassName', dir);
		},
		tag: function(obj, dir) { //return tag objects
			return $.prototype.dom.get(obj, 'getElementsByTagName', dir);
		},
		query: function(obj, dir) { //return tag objects
			return $.prototype.dom.get(obj, 'querySelector', dir , 1);
		},
		queryall: function(obj, dir) { //return tag objects
			return $.prototype.dom.get(obj, 'querySelectorAll', dir);
		},
		event: function(name, event_name,type, dir) {
			var obj = $.prototype.dom.r();
			
			if(type=='-'){
				$('@event.remove')(obj,name, event_name);
			}
			if(type=='+'){
				$('@event.add')(obj,name, event_name);
			}
			
			if (dir) {
				return $.prototype.scope(dir);
			} else {
				$.prototype.dom.obj = null;
			}
			return obj;
		},
		has:function(name,dir){
			return $.prototype.dom.at({
				info:{
					attr:'hasAttribute',
					item:name,
				},
				attr:'prop',
				attr_return:1,
				scope:dir
			});
		},
		cl: function(name, attr, dir) { //classList
			var data={
				info:{
					attr:'classList',
					item:name,
				},
				attr:'prop',
				attr_sub:attr,
				scope:dir
			};
			
			switch (attr) {
				case '+':
					data.attr_sub = 'add';
					break;
				case '-':
					data.attr_sub = 'remove';
					break;
				case 'has':
					data.attr_sub = 'contains';
					data.attr_return=1;
					break;
				case 'contains':
					data.attr_return=1;
					break;
				default:
					break;
			}
			
			return $.prototype.dom.at(data);
		},
		tc: function(name, dir) { //textcontent
			return $.prototype.dom.at({
				info:{
					attr:'textContent',
					item:name,
				},
				attr:'prop_min',
				scope:dir
			});
		},
		cn: function(name, dir) { //className
			return $.prototype.dom.at({
				info:{
					attr:'class',
					item:name,
				},
				attr:'attr',
				scope:dir
			});
		},
		attr: function(attr, item, dir) { //attr
			var returned = $.prototype.dom.at({
				info:{
					attr:attr,
					item:item,
				},
				attr:'attr',
				scope:dir
			});
			return returned;
		},
		remove: function(dir) { //remove obj
			return $.prototype.dom.at({
				attr:'remove',
				scope:dir
			});
		},
		clear: function(dir) { //clear obj
			return $.prototype.dom.at({
				attr:'clear',
				scope:dir
			});
		},
		html: function(html, type, dir) { //place html
			return $.prototype.dom.at({
				info:{
					html:html,
					type:type
				},
				attr:'html',
				scope:dir
			});
		},
		upto: function(name, dir) {
			var obj = $.prototype.dom.r();
			while (obj.parentNode) {
				var obj = obj.parentNode;
				var cls = obj.classList;
				if (!cls) {
					return false;
				}
				if (obj.classList.contains(name)) {
					break;
				}
			}
			return obj;
		},
		parlv: function() {
			var obj = $.prototype.dom.r();
			var i = Number(obj.dataset.lv);
			if (i > 0) {
				var obj = obj.parentNode;
				var i = i - 1;
				if (i > 0) {
					while (i--) {
						var obj = obj.parentNode;
					}
				}
			}
			var i = null;
			return obj;
		},
		ison: function(name, dir) { //ison
			return $.prototype.dom.at({
				info:name,
				attr:'ison',
				scope:dir
			});
		},
		sub: function(name, dir) { //subtract num to span
			return $.prototype.dom.at({
				info:name,
				attr:'sub',
				scope:dir
			});
		},
		add: function(name, dir) { //add num to span
			return $.prototype.dom.at({
				info:name,
				attr:'add',
				scope:dir
			});
		},
		center: function(dir) { //center html obj
			return $.prototype.dom.at({
					attr:'center',
					scope:dir
				});
		},
		click: function(dir) { //center html obj
			$.prototype.event.click();
			if (dir) {
				return $.prototype.scope(dir);
			} else {
				$.prototype.dom.obj = null;
			}
		},
		attr_op:function(data){
			var obj=data.obj,
				 item=data.info.item,
				 attr=data.info.attr;
			var data=null;
				 
			if ($('@strng.hasvalue')(item)) {
				if (item == '-') {
					obj.removeAttribute(attr);
				}else{
					obj.setAttribute(attr, item);
				}
				return obj;
			}
			return obj.getAttribute(attr);
		},
		ison_op:function(data){
			var obj=data.obj,
			info=data.info;
			var data=null;
			var cls=obj.classList;
			if (cls.contains('ison')) {
				if (info) {
					$(obj, 'span').sub(info);
				}
				cls.remove('ison');
			} else {
				if (info) {
					$(obj, 'span').add(info);
				}
				cls.add('ison');
			}
			return obj;
		},
		clear_op:function(data){
			var obj=data.obj;
			var data=null;
			
			while (obj.firstChild) {
				obj.removeChild(obj.firstChild);
			}
			
			return obj;
		},
		remove_op:function(data){
			var obj=data.obj;
			var data=null;
			return obj.parentNode.removeChild(obj) || false;
		},
		add_op:function(data){
			var obj=data.obj,
				info=data.info;
				var data=null;
			return obj.textContent = Number(obj.textContent) + Number(info);
		},
		sub_op:function(data){
			var obj=data.obj,
				info=data.info;
				var data=null;
			return obj.textContent = Number(obj.textContent) - Number(info);
		},
		center_op:function(data){
			var obj=data.obj,
			data=null,
			item = obj.dataset.centerobj,
			itemname = item.replace(/ /g,'$').replace(/#/g,'$').replace(/\./g,'$');
			
			if (item) {
				var wh = $('%dom.wh')[itemname];
				if (!wh) {
					var item = $(item, '!');
					var w = Number(item.offsetWidth),
						h = Number(item.offsetHeight);
					$('%dom.wh')[itemname] = [w, h];
					console.log('DIV CENTER SAVED');
				} else {
					var w = Number(wh[0]),
						h = Number(wh[1]);
					console.log('DIV CENTER SAVED USED');
				}
			} else {
				var w = Number($('%dom.body_width')),
					h = Number($('%dom.body_height'));
			}
			var divW = obj.offsetWidth,
				divH = obj.offsetHeight;
			if (divH > h) {
				obj.removeAttribute('style');
			} else {
				var left = parseInt((w - divW) / 2) + 'px',
					top = parseInt((h - divH) / 2) + 'px';
				obj.setAttribute("style", 'position:absolute;\
				-webkit-transform:translate3d(' + left + ',' + top + ',0);\
				transform:translate3d(' + left + ',' + top + ',0)');
			}
			return obj;
		},
		prop_op:function(data){
			var obj=data.obj,
			 item=data.info.item,
			 attr=data.info.attr,
			 attr_sub=data.attr_sub,
			 attr_return=data.attr_return;
			 var data=null;
			if ($('@strng.hasvalue')(item)) {
				var i=item.length,
				act =[];
				if(i > 0){
					if ($.prototype.strng.has(item, ',')) {
						var item = item.split(','),
						i=item.length;
					}
					if (item instanceof Array) {
						while (i--) {
							if(attr_sub){
								act.push(obj[attr][attr_sub](item[i]));
							}else{
								act.push(obj[attr](item[i]));
							}
						}
					}else{
						if(attr_sub){
							var act = obj[attr][attr_sub](item);
						}else{
							var act = obj[attr](item);
						}
					}
					if (attr_return) {
						return act;
					}else{
						return obj;
					}
				}
			}
			return obj[attr];
		},
		prop_min_op:function(data){
		
			var obj=data.obj,
			 item=data.info.item,
			 attr=data.info.attr,
			 attr_sub=data.attr_subb,
			 attr_return=data.attr_return;
			 var data=null;
			if($.prototype.strng.hasvalue(item)){
				var act = obj[attr]=item;
				if (attr_return) {
					return act;
				}
				return obj;
			}
			
			return obj[attr];
		},
		html_op:function(data){
				var obj=data.obj,
				 info=data.info,
				 attr = info.type,
				 item = info.html;
				if (attr == 'ap') {
					return obj.appendChild(item);
				}
				if (!$.prototype.strng.hasvalue(item) && !attr) {
					return obj.innerHTML;
				}
				if(!attr){
					var attr='in';
				}
				if (attr == 'in') {
					if (obj) {
						while (obj.firstChild) {
							obj.removeChild(obj.firstChild);
						}
					}
					if ($('@dom.is')(item)) {
						return obj.appendChild(item);
					}
					var attr = 'be';
				}
				if (item) {
					if (attr == 'ib') {
						return obj.parentNode.insertBefore(item, obj);
					}
					if (attr == 'be') {
						var tempDiv = document.createElement('div');
						tempDiv.insertAdjacentHTML("beforeend", item);
						var frag = document.createDocumentFragment();
						while (tempDiv.hasChildNodes()) {
							frag.appendChild(tempDiv.removeChild(tempDiv.firstChild));
						}
						var tempDiv = null;
						obj.appendChild(frag);
						var item = null,
							attr = null,
							frag = null;
						return obj;
					}
					if (attr == 'ab') {
						var attr = "afterbegin";
					}
					if (attr == 'bb') {
						var attr = "beforeBegin";
					}
					if (attr == 'ae') {
						var attr = "afterEnd";
					}
					obj.insertAdjacentHTML(attr, item);
				}
				var item = null,
					attr = null;
				var data=null;
				return obj;
		},
		op: function(data) {
						
			if (!data.obj) {return false;}
			
			if (data.attr) {
				var returned=$.prototype.dom[data.attr+'_op'](data),
				data=null;
				return returned;
			}
			
			return obj;
		},
		htmlobj_array: function(data) {
			
			var obj=data.obj;
		
			if (obj instanceof Array) {
				var i = obj.length;
				while (i--) {
					if (obj[i] instanceof Array) {
						var a = obj[i].length;
						while (a--) {
							data.obj=obj[i][a];
							obj[i][a] = $.prototype.dom.op(data);
						}
					} else {
						data.obj=obj[i];
						obj[i] = $.prototype.dom.op(data);
					}
				}
				return obj;
			} else {
				var obj=null;
				return $.prototype.dom.op(data);
			}
			
			return false;
		},
		dynamic_loop_acts: function(data) {
			
			var obj=data.vars,
				type=data.dynamic,
				htmlobj=data.dynamic_obj;
												
				if(data.info){
					var attr=data.info.attr;
				}
								
			data.vars=null;
			data.dynamic=null;
			
			if (obj) {
				var items = obj.split(':');
			} else {
				var items = obj;
			}
			
			if (!items[1]) {
				items[1] = '';
			}
			if (items[1].substring(0, 5) == 'this.') {
				items[1] = htmlobj[items[1].split('.')[1]];
			}
			if (items[0] == 'this') {
				var send_obj = htmlobj;
			}
			if (items[0] != 'this' && type != 'mem') {
				var send_obj = $(items[0], '!');
			}
			
			if (type == 'memtog') {
				var tog = items[1].split('|');
				if (send_obj == tog[0]) {
					$(items[0], tog[1]);
				} else {
					$(items[0], tog[0]);
				}
				var send_obj = null;
			}
			if (type == 'mem') {
				$(items[0], items[1]);
			}
			if (type == 'to') {
				var parent = $(items[0], '!');
				if (!parent.classList.contains(items[1])) {
					parent.className = '';
				}
				var send_obj=$(items[0], '!');
			}
			
			if(send_obj){
				data.obj=send_obj;
				data.info.item=items[1];
				$.prototype.dom.htmlobj_array(data);
			}
			var data=null;
			var send_obj = null;
			return false;
		},
		dynamic_loop: function(data) {
			var obj=data.vars;
			if (obj) {
				
				var cmds = obj.split('/'),
					i = cmds.length;
				if (i > 1) {
					while (i--) {
						data.vars=cmds[i];
						$.prototype.dom.dynamic_loop_acts(data);
					}
				} else {
					$.prototype.dom.dynamic_loop_acts(data);
				}
			}
			var data=null;
			var obj = null,
				type = null;
			return false;
		}
	},
	strng: {
		hasvalue: function(strng){
			var r= false;
			if (strng || strng === false || strng === '' || strng === 0) {
				var r= true;
			}
			var strng=null;
			return r;	
		},
		is: function(str) {
			return str.constructor === String;
		},
		has: function(str, srch) { //search string return true or false
			return str.indexOf(srch) != -1;
		},
		duc:function(strng){
			return 	decodeURIComponent(strng);
		}
	},
	array: {
		slice: Array.prototype.slice,
		to: function(nodes) { //nodelist to array
			return $.prototype.array.slice.call(nodes) || nodes;
		},
		list:function(strng,reped){
			var reped=(reped)?reped:' ';
			return (Array.isArray(strng)) ? strng.toString().replace(/,/g, reped) : strng;	
		}
	},
	timer:function(fun,time){
		var fun=($('@strng.is')(fun))? $(fun): fun ;
		setTimeout(function() {
			fun();
			fun=null;
			time=null;
			return false;
		}, time);
		return false;	
	},
	sync_apply:function(data){
		var len=data.length;
		var i=0;
		while(i < len){
			if($.prototype.strng.is(data[i][0])){
				$(data[i][0]).apply(null, data[i][1]);
			}else{
				data[i][0].apply(null, data[i][1]);
			}
				data[i]=null;
			i++;
		}
		var data=null;
		return false;
	},
	sync:function (){
		var data=$.prototype.array.to(arguments);
		setTimeout(function() {
			$.prototype.sync_apply(data);
			data=null;
			return false;
		}, 10);
		return false;
	},
	async_apply:function(item){
		if($.prototype.strng.is(item[0])){
			$(item[0]).apply(null, item[1]);
		}else{
			item[0].apply(null, item[1]);
		}
		var item=null;
		return false;
	},
	async:function (){
		var data=$.prototype.array.to(arguments);
		var len=data.length;
		var i=0;
		while(i < len){
			var item=data[i];
			(function (item)  {
				setTimeout(function(){
					$.prototype.strng.async_apply(item);
					item=null;
					return false;
				},10+i);
				return false;
			} ) (item);
			i++;
		}
		var data=null;
		return false;
	}
};