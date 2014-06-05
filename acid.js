/**
 * ACID JS BETA.
 * @version 1.6
 * @author Thomas Marchi
 * @copyright 2014 Thomas Marchi
 * @LNKit.com
 * @email tom@lnkit.com
 */
 
"use strict";

function $(name, item, act) {
	//import scopes
	var proto=$.prototype,
		scope = proto.scope,
		dom =proto.dom;
		
	if (name) {
		if (name.constructor === String) {
			
			//quick function access
			if(name[0] == '@'){
				if(name.length==1){
					return proto;
				}
				var obj= proto.find_fun(name.substring(1));
				return obj;
			}
				
			//mem access
			if(name[0] == '%'){
				if(name.length==1){
					return proto;
				}
				if (proto.strng.hasvalue(item)) {
					if (item != '#' && item != '!') {
						proto.mem[name.substring(1)] = item;
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
			var obj=proto.select_temp(name);
			if(!obj){
				var obj=dom.select(name);
			}
			
			if (!obj) {
				var obj = false;
			}else{
				if(act){
					if (act == 'last') {
						var obj = obj[obj.length - 1];
					}
					if (typeof act === 'number') {
						var obj = obj[act];
					}
				}
			}
			
			if (item == '!') {
				return obj;
			}
			if(obj.length){
				var obj=$.prototype.array.to(obj);
			}
			dom.obj = obj;
			var obj = null,
				item = null,
				name = null;
			return dom;
		}
		
		if (name.length) {
			if (item == '#' || dom.is(name[0])) {
				if(name instanceof HTMLCollection || name instanceof NodeList){
					var name=$.prototype.array.to(name);
				}
				dom.obj = name;
				return dom;
			}
			if(item){
				return scope(item);
			}
			return obj;
		}
		
		if (dom.is(name)) {
			if (item && item != '#') {
				if (typeof item === "string") {
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
	select_temp:function(name,item){
		var selectis=$.prototype.temp[name];
		if(selectis){
			return selectis();
		}
		return false;
	},
	temp:{},
	tempclear:function(name){
		$.prototype.temp={};
		name=null;
		return false;
	},
	symbol:{
		'@':function(){
			$.prototype.dom.obj = null;
			return $.prototype;
		},
		'#':function(){
			return $.prototype.dom;
		},
		'!':function(){
			return $.prototype.dom.obj;
		},
		'%':function(){
			$.prototype.dom.obj = null;
			return $.prototype.mem;
		},
		'$':function(){
			$.prototype.dom.obj = null;
			return $;
		},
	},
	find_fun:function(name){
		if ($.prototype.strng.has(name, '.')) {
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
			return $.prototype.symbol[scope]();
		}
		return $.prototype.find_fun(scope.substring(1));
	},
	queryall:function(item,context){
		var opt=false;
		if(!context){
			var context=document;
			var opt=true;
		}
		return context.querySelectorAll(item) || false;
	},
	query:function(item,context){
		var opt=false;
		if(!context){
			var context=document;
			var opt=true;
		}
		return context.querySelector(item) || false;
	},
	 dom: {
		select:function(select,context){
			var k = /^.[\w_-]+$/,
				nt = /^[A-Za-z]+$/,
				save=false,
				obj=false;
			 
			if(!context){
				var context=document,
				save=true;
			}
			 
			if (select[0] === ".") {
                if (k.test(select)){
	                var obj= context.getElementsByClassName(select.slice(1));
	                if(save){
	                	var fun=function(){
							 return obj;
						};
	                }
                }
            } else if (select[0] === "#") {
                if (k.test(select)){
                	var obj=context.getElementById(select.slice(1));
                	if(save){
	                	var safe=select.slice(1),
	                		fun=function(){
							 return document.getElementById(safe);
						};
					}
                }
            } else if (nt.test(select)){
	            var obj= context.getElementsByTagName(select);
	            if(save){
		            var fun=function(){
						return obj;
					};
				}
            }
            if(!obj){
	         	var obj= context.querySelectorAll(select);
			 	if(save){
				 	var fun=function(){
						return document.querySelectorAll(select);
					};
				}
            }
				
			if(!obj){
				var obj=false;
			}
			var len=obj.length;
			if(len === 0){
				var obj=false;
			}
			if(obj && save){
				$.prototype.temp[select]=fun;
			}
			return obj;	
		},
		obj: {},
		r: function(dir) {
			var obj=$.prototype.dom.obj;
			if(!dir){
				$.prototype.dom.obj = null;
			}
			return (dir) ? $.prototype.scope(dir) : obj;
		},
		exist:function(){
			var r=false,
			obj=$.prototype.dom.obj;
			if(obj){
				if(obj.length){
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
			return typeof obj.nodeType == "number";
		},
		at: function(data) {
			var scope=data.scope;
			data.obj=$.prototype.dom.obj;
			
			var obj = $.prototype.dom.loop(data);
			if (!scope) {
				$.prototype.dom.obj = null;
			}
			return (scope) ? $.prototype.scope(scope) : obj;
		},
		get: function(cls_obj, type, dir) { //return class objects
			var parent=$.prototype.dom.obj;
			if(!$.prototype.dom.is(parent)){
				var parent=document;
			}
			var obj = parent[type](cls_obj) || false;
			$.prototype.dom.obj = obj;
			return (!dir) ? $.prototype.dom : $.prototype.scope(dir);
		},
		cls: function(obj, dir) { //return class objects
			return $.prototype.dom.get(obj, 'getElementsByClassName', dir);
		},
		tag: function(obj, dir) { //return tag objects
			return $.prototype.dom.get(obj, 'getElementsByTagName', dir);
		},
		query: function(obj, dir) { //return querySelector objects
			return $.prototype.dom.get(obj, 'querySelector', dir , 1);
		},
		queryall: function(obj, dir) { //return querySelectorAll objects
			return $.prototype.dom.get(obj, 'querySelectorAll', dir);
		},
		event: function(name, event_name,type, dir) {
			var obj = $.prototype.dom.obj
			
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
		build:function(attr,dir,infoattr){
			var data={
				attr:attr,
				scope:dir,
				info:{}
			};
			if(infoattr){
				data.info.attr=infoattr;
			}
			var attr=null,dir=null,infoattr=null;
			return data;
		},
		has:function(name,dir){
			var data=$.prototype.dom.build('prop',dir,'hasAttribute');
			data.info.item=name;
			data.attr_return=1;
			return $.prototype.dom.at(data);
		},
		cl: function(name, attr, dir) { //classList
			var data=$.prototype.dom.build('prop',dir,'classList');
			data.info.item=name;
			data.attr_sub=attr;

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
			var data=$.prototype.dom.build('objprop',dir,'textContent');
			data.info.item=name;
			return $.prototype.dom.at(data);
		},
		val: function(name, dir) { //textcontent
			var data=$.prototype.dom.build('objprop',dir,'value');
			data.info.item=name;
			return $.prototype.dom.at(data);
		},
		sel: function(name, dir) { //textcontent
			var data=$.prototype.dom.build('objprop',dir,'selected');
			data.info.item=name;
			return $.prototype.dom.at(data);
		},
		ihtml: function(name, dir) { //innerhtml
			var data=$.prototype.dom.build('ihtml',dir);
			data.info=name;
			return $.prototype.dom.at(data);
		},
		ow: function(name, dir) { //offsetWidth
			var data=$.prototype.dom.build('objprop',dir,'offsetWidth');
			return $.prototype.dom.at(data);
		},
		oh: function(name, dir) { //offsetHeight
			var data=$.prototype.dom.build('objprop',dir,'offsetHeight');
			return $.prototype.dom.at(data);
		},
		ot: function(name, dir) { //offsetTop
			var data=$.prototype.dom.build('objprop',dir,'offsetTop');
			return $.prototype.dom.at(data);
		},
		cn: function(name, dir) { //className
			var data=$.prototype.dom.build('attr',dir,'class');
			data.info.item=name;
			return $.prototype.dom.at(data);
		},
		attr: function(attr, item, dir) { //attr
			var data=$.prototype.dom.build('attr',dir,attr);
			data.info.item=item;
			return $.prototype.dom.at(data);
		},
		remove: function(dir) { //remove obj
			var data=$.prototype.dom.build('remove',dir);
			return $.prototype.dom.at(data);
		},
		clear: function(dir) { //clear obj
			var data=$.prototype.dom.build('clear',dir);
			return $.prototype.dom.at(data);
		},
		hide: function(dir) { //clear obj
			var data=$.prototype.dom.build('hide',dir);
			return $.prototype.dom.at(data);
		},
		show: function(dir) { //clear obj
			var data=$.prototype.dom.build('show',dir);
			return $.prototype.dom.at(data);
		},
		html: function(html, type, dir) { //place html
			var data=$.prototype.dom.build('html',dir);
			data.info.html=html;
			data.info.type=type;
			return $.prototype.dom.at(data);
		},
		ison: function(name, dir) { //ison
			var data=$.prototype.dom.build('ison',dir);
			data.info=name;
			return $.prototype.dom.at(data);
		},
		sub: function(name, dir) { //subtract num to span
			var data=$.prototype.dom.build('sub',dir);
			data.info=name;
			return $.prototype.dom.at(data);
		},
		add: function(name, dir) { //add num to span
			var data=$.prototype.dom.build('add',dir);
			data.info=name;
			return $.prototype.dom.at(data);
		},
		center: function(dir) { //center html obj
			var data=$.prototype.dom.build('center',dir);
			return $.prototype.dom.at(data);
		},
		upto: function(name, dir) {
			var obj = $.prototype.dom.obj
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
			var obj = $.prototype.dom.obj
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
		click: function(dir) { //center html obj
			$.prototype.event.click();
			if (dir) {
				return $.prototype.scope(dir);
			} else {
				$.prototype.dom.obj = null;
			}
		},
		loop: function(data) {
			
			var obj=data.obj,
			attr=data.attr;
			
			if(!obj){
				return false;
			}
			
			var empty=[];

			var ii = obj.length;
			if (ii) {
				for (var i = 0; i < ii; i++) {
					var aa = obj[i].length;
					if (aa) {
						empty[i]=[];
						for (var i = 0; i < aa; i++) {
							var temp=obj[i][a];
							data.obj=temp;
							empty[i][a]=false;
							if(temp){
								empty[i][a] = $.prototype.op[attr](data);
							}
						}
					} else {
						var temp=obj[i];
						data.obj=temp;
						empty[i]=null;
						if(temp){
							empty[i] = $.prototype.op[attr](data);
						}
					}
				}
				var temp=null,attr=null,obj=null,data=null;
				return empty;
			} else {
				if(obj){
					return $.prototype.op[data.attr](data);
				}
			}
			
			return false;
		},
		dyloopop: function(data) {
			
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
				var send_obj = $(items[0],'#').r();
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
				var parent = $(items[0],'!');
				if (!parent.classList.contains(items[1])) {
					parent.className = '';
				}
				var send_obj=$(items[0]).r();
			}
			
			if(send_obj){
				data.obj=send_obj;
				data.info.item=items[1];
				
				$.prototype.dom.loop(data);
			}
			var data=null;
			var send_obj = null;
			return false;
		},
		dyloop: function(data) {
			var obj=data.vars;
			if (obj) {
				
				var cmds = obj.split('/'),
					i = cmds.length;
				if (i > 1) {
					while (i--) {
						data.vars=cmds[i];
						$.prototype.dom.dyloopop(data);
					}
				} else {
					$.prototype.dom.dyloopop(data);
				}
			}
			var data=null;
			var obj = null,
				type = null;
			return false;
		}
	},
    op:{
		attr:function(data){
			var obj=data.obj,
				 item=data.info.item,
				 attr=data.info.attr;
			var data=null;
				 
			if ($.prototype.strng.hasvalue(item)) {
				if (item == '-') {
					obj.removeAttribute(attr);
				}else{
					obj.setAttribute(attr, item);
				}
				return obj;
			}
			return obj.getAttribute(attr);
		},
		ison:function(data){
			var obj=data.obj,
			info=data.info;
			var data=null;
			var cls=obj.classList;
			if (cls.contains('ison')) {
				if (info) {
					var temp=obj.getElementsByTagName('span')[0];
					$('@timer')(function(){$(temp).sub(info);},0);
				}
				cls.remove('ison');
			} else {
				if (info) {
					var temp=obj.getElementsByTagName('span')[0];
					$('@timer')(function(){$(temp).add(info);},0);
				}
				cls.add('ison');
			}
			return obj;
		},
		clear:function(data){
			var obj=data.obj;
			var data=null;
			
			while (obj.firstChild) {
				obj.removeChild(obj.firstChild);
			}
			
			return obj;
		},
		remove:function(data){
			var obj=data.obj;
			var data=null;
			return obj.parentNode.removeChild(obj) || false;
		},
		hide:function(data){
			var obj=data.obj;
			obj.style.display="none";
			var data=null;
			return obj;
		},
		show:function(data){
			var obj=data.obj;
			obj.style.display="";
			var data=null;
			return obj;
		},
		add:function(data){
			var obj=data.obj,
				info=data.info;
				var data=null;
			return obj.textContent = Number(obj.textContent) + Number(info);
		},
		sub:function(data){
			var obj=data.obj,
				info=data.info;
				var data=null;
			return obj.textContent = Number(obj.textContent) - Number(info);
		},
		center:function(data){
			var obj=data.obj,
			data=null,
			item = obj.dataset.centerobj,
			itemname = item;
			
			if (item) {
				var wh = $('%dom.wh')[itemname];
				if (!wh) {
					var item = $(item).r();
					if(item.length){
						var item =item[0];
					}
					var w = Number($(item).ow().toString()),
						h = Number($(item).oh().toString());
						if(h && w && item){
							$('%dom.wh')[itemname] = [w, h];
						}
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
			var divW = $(obj).ow(),
				divH = $(obj).oh();
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
		prop:function(data){
			var obj=data.obj,
			 item=data.info.item,
			 attr=data.info.attr,
			 attr_sub=data.attr_sub,
			 attr_return=data.attr_return;
			 var data=null;
			if ($.prototype.strng.hasvalue(item)) {
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
		objprop:function(data){
			var obj=data.obj,
			 item=data.info.item,
			 attr=data.info.attr,
			 attr_sub=data.attr_subb,
			 attr_return=data.attr_return;
			 var data=null;
			if($.prototype.strng.hasvalue(item)){
				obj[attr]=item;
				if (attr_return) {
					return item;
				}
				return obj;
			}
			return obj[attr];
		},
		ihtml:function(data){
			var obj=data.obj,
			item = data.info,
			data=null;
			if(!$.prototype.strng.hasvalue(item)){
				return obj.innerHTML;
			}
			obj.innerHTML=item;
			var item = null;
			return obj;
		},
		html:function(data){
				var obj=data.obj,
				 info=data.info,
				 attr = info.type,
				 item = info.html,
				 hasvalue=$.prototype.strng.hasvalue(item);
				
				if(!attr){
					if (!hasvalue) {
						return obj.innerHTML;
					}else{
						return obj.innerHTML=item;
					}
				}
	
				if (hasvalue) {
					if (attr == 'in') {
						return obj.innerHTML=item;
					}
					if (attr == 'ap') {
						obj.appendChild(item);
						return obj;
					}
					if (attr == 'ib') {
						obj.parentNode.insertBefore(item, obj);
						return obj;
					}
					else if (attr == 'be') {
						var attr = "beforeEnd";
					}
					else if (attr == 'ab') {
						var attr = "afterbegin";
					}
					else if (attr == 'bb') {
						var attr = "beforeBegin";
					}
					else if (attr == 'ae') {
						var attr = "afterEnd";
					}
					obj.insertAdjacentHTML(attr, item);
				}
				var item = null,
					attr = null,
					data=null;
				return obj;
		}
	},
	strng: {
		hasvalue: function(strng){
			return strng !== undefined;	
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
			var arr = [];
		    for(var i=-1,l=nodes.length;++i!==l;arr[i]=nodes[i]);
		    return arr;
		},
		list:function(strng,reped){
			var reped=(reped)?reped:' ';
			return (Array.isArray(strng)) ? strng.toString().replace(/,/g, reped) : strng;	
		}
	},
	timer:function(fun,time){
		var fun=($.prototype.strng.is(fun))? $(fun): fun ;
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
	},
	mem:{
		dom:{},
		url:{},
		sys: {
			name: 'ACID.js',
			version: 1.6,
			platform_version: 'debug_platform',
			cores: 2
		}
	},
	l:localStorage, //helper
	clearl:function(fun){localStorage.clear();}, //helper
	s:sessionStorage, //helper
	clears:function(fun){sessionStorage.clear();}, //helper
	raf:function(fun){
		var fun=($.prototype.strng.is(fun))? $(fun): fun ;
		requestAnimationFrame(fun);
	}, //helper
	caf:function(fun){
		var fun=($.prototype.strng.is(fun))? $(fun): fun ;
		cancelAnimationFrame(fun);
	} //helper
};

setInterval($.prototype.tempclear,25000);//GC for class/tag live node lists