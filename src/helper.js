/*
Developed by @mario v1.2.20221003
*/
var $ = {
	//网络请求
	ajax: function(method, url, data, success, error, returnJson) {
		method = method.toUpperCase()
		var async = method === 'GET';
		if (this.isPlainObject(data)) data = this.param(data);
		if (!/^https?:\/\//.test(url)) url = _api_root + '/' + this.trim(url, '/');
		if (async && data) url += (url.indexOf('?') > -1 ? '&' : '?') + data;
		var header = {
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			'X-Requested-With': 'XMLHttpRequest',
		};
		if (method === 'JSON') {
			method = 'POST';
			header['Content-Type'] = 'application/json; charset=UTF-8';
		}
		var xhr = cc.loader.getXMLHttpRequest();
		xhr.open(method, url, async);
		for (var key in header) xhr.setRequestHeader(key, header[key]);
		xhr['onloadend'] = function() {
			if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status <= 207)) {
				var json = xhr.responseText;
				if (this.isJsonString(json)) {
					json = JSON.parse(json);
					if (typeof json.code !== 'undefined' && typeof json.msg !== 'undefined') {
						if (json.code !== 0) {
							if (error) error(json.msg);
							return;
						}
					}
				} else if (returnJson) {
					console.log(json)
					if (error) error(json);
					return;
				}
				if (success) success(json);
			} else {
				if (error) error();
			}
		}
		if (async) xhr.send();
		else xhr.send(data);
	},
	get: function(url, data, success, error, returnJson) {
		if (typeof data !== 'undefined') {
			if (typeof data === 'string') {
				url += (url.includes('?') ? '&' : '?') + data
			} else if (this.isPlainObject(data) && Object.keys(data).length) {
				url += (url.includes('?') ? '&' : '?') + this.param(data)
			} else if (this.isFunction(data)) {
				returnJson = error
				error = success
				success = data
			} else if (typeof data === 'boolean') {
				returnJson = data
				error = null
				success = null
			}
		}
		this.ajax('GET', url, null, success, error, returnJson)
	},
	post: function(url, data, success, error, returnJson) {
		if (typeof success === 'boolean') {
			returnJson = success
			error = null
			success = null
		}
		if (typeof error === 'boolean') {
			returnJson = error
			error = null
		}
		this.ajax('POST', url, data, success, error, returnJson)
	},
	//对象转url参数
	param: function(data) {
		if (this.isPlainObject(data)) {
			var query = [];
			for (var key in data) query.push(key + '=' + data[key]);
			return query.join('&');
		}
		return data;
	},
	//清除首尾指定字符串
	trim: function(str, separate) {
		if (str.length) {
			if (typeof (separate) === 'undefined') {
				return str.replace(/^\s+|\s+$/, '');
			} else if (separate.length) {
				var re = new RegExp('^(' + separate + ')+|(' + separate + ')+$');
				return str.replace(re, '');
			}
		}
		return '';
	},
	//保留n位小数
	round: function(str, num) {
		return this.numberFormat(str, num);
	},
	numberFormat: function(str, num) {
		if (typeof (num) === 'undefined') num = 2;
		return parseFloat(str).toFixed(num);
	},
	//金额样式, 每三位加逗号
	amountFormat: function(num) {
		return num.toString().replace(/\d+/, function(n) {
			return n.replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')
		});
	},
	//精确加法, arguments[2]要保留的小数位数(可以不传此参数,如不传则不处理小数位数)
	bcadd: function(num, arg) {
		var r1 = num.toString(), r2 = arg.toString(), m, result, d = arguments[2];
		var r1Arr = r1.split('.'), r2Arr = r2.split('.'), d1 = r1Arr.length === 2 ? r1Arr[1] : '', d2 = r2Arr.length === 2 ? r2Arr[1] : '';
		var len = Math.max(d1.length, d2.length);
		m = Math.pow(10, len);
		result = Number(((r1 * m + r2 * m) / m).toFixed(len));
		return (typeof d !== 'number') ? Number(result) : Number(result.toFixed(parseInt(d)));
	},
	//精确减法
	bcsub: function(num, arg) {
		return this.bcadd(num, -Number(arg), arguments[2]);
	},
	//精确乘法
	bcmul: function(num, arg) {
		var r1 = num.toString(), r2 = arg.toString(), m, result, d = arguments[2];
		m = (r1.split('.')[1] ? r1.split('.')[1].length : 0) + (r2.split('.')[1] ? r2.split('.')[1].length : 0);
		result = (Number(r1.replace('.', '')) * Number(r2.replace('.', ''))) / Math.pow(10, m);
		return (typeof d !== 'number') ? Number(result) : Number(result.toFixed(parseInt(d)));
	},
	//精确除法
	bcdiv: function(num, arg) {
		var r1 = num.toString(), r2 = arg.toString(), m, result, d = arguments[2];
		m = (r2.split('.')[1] ? r2.split('.')[1].length : 0) - (r1.split('.')[1] ? r1.split('.')[1].length : 0);
		result = (Number(r1.replace('.', '')) / Number(r2.replace('.', ''))) * Math.pow(10, m);
		return (typeof d !== 'number') ? Number(result) : Number(result.toFixed(parseInt(d)));
	},
	//是否在数组里
	inArray: function(obj, arrayObj) {
		var index = -1;
		if (arrayObj && (arrayObj instanceof Array) && arrayObj.length) {
			for (var i = 0; i < arrayObj.length; i++) {
				if (obj === arrayObj[i]) {
					index = i;
					break;
				}
			}
		}
		return index;
	},
	//是否数组
	isArray: function(obj) {
		if (!obj) return false;
		return (obj instanceof Array);
	},
	//是否数字字面量
	isPlainObject: function(obj) {
		if (!obj) return false;
		return obj && typeof (obj)==='object' && Object.prototype.toString.call(obj).toLowerCase()==='[object object]';
		
	},
	//是否空对象
	isEmptyObject: function (obj) {
		if (!this.isPlainObject(obj)) return true;
		return JSON.stringify(obj) === '{}';
	},
	//是否函数
	isFunction: function(func) {
		if (!func) return false;
		return (func instanceof Function);
	},
	//是否数字
	isNumber: function(str) {
		return !isNaN(str);
	},
	//检测是否JSON对象
	isJson: function(obj) {
		return this.isPlainObject(obj);
	},
	//检测是否JSON字符串
	isJsonString: function(str) {
		if (this.isJson(str)) return true;
		var ret = null;
		try {
			ret = JSON.parse(str);
		} catch (e) {}
		return ret !== null;
	},
	//使用对象扩展另一个对象
	extend: function() {
		var args = null;
		if (this.isArray(arguments[0])) {
			args = this.clone(arguments[0]);
			if (!this.isArray(args)) args = [];
			for (var i = 1; i < arguments.length; i++) {
				if (!this.isArray(arguments[i])) continue;
				args = args.concat(this.clone(arguments[i]));
			}
		} else {
			args = this.clone(arguments[0]);
			if (!this.isPlainObject(args)) args = {};
			for (var i = 1; i < arguments.length; i++) {
				if (!this.isPlainObject(arguments[i])) continue;
				for (var key in arguments[i]) {
					args[key] = this.clone(arguments[i][key]);
				}
			}
		}
		return args;
	},
	//数组循环
	each: function(arr, callback) {
		if (!this.isFunction(callback)) return this;
		if (this.isArray(arr)) {
			for (var i = 0; i < arr.length; i++) {
				var res = callback.call(arr[i], i, arr[i]);
				if (typeof (res) === 'boolean') {
					if (!res) break;
				}
			}
		} else if (this.isPlainObject(arr)) {
			for (var key in arr) {
				var res = callback.call(arr[key], key, arr[key]);
				if (typeof (res) === 'boolean') {
					if (!res) break;
				}
			}
		} else {
			callback.call(arr, 0, arr);
		}
		return this;
	},
	//克隆对象或数组
	clone: function(obj) {
		if (!obj) return obj;
		if (obj instanceof Date) {
			return new Date(obj.valueOf());
		} else if (obj instanceof Array) {
			var newArr = [];
			for (var i = 0; i < obj.length; i++) {
				newArr.push(this.clone(obj[i]));
			}
			return newArr;
		} else if (obj && typeof (obj)==='object' && Object.prototype.toString.call(obj).toLowerCase()==='[object object]') {
			var newObj = {};
			for (var key in obj) {
				newObj[key] = this.clone(obj[key]);
			}
			return newObj;
		}
		return obj;
	},
	//点击
	tap: function(callback, secondCallback, cancelCallback) {
		if (secondCallback instanceof Function) {
			var tmpCallback = secondCallback
			secondCallback = callback
			callback = tmpCallback
		}
		cc.eventManager.addListener({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true, //设置是否吞没事件, 在 onTouchBegan 返回 true 时吞掉事件, 不再向下传递
			onTouchBegan: function(touch, event) {
				var target = event.getCurrentTarget();
				if (!target.isVisible()) return false;
				var pos = target.convertToNodeSpace(touch.getLocation());
				if (cc.rectContainsPoint(cc.rect(0, 0, target.width, target.height), pos)) {
					if (secondCallback instanceof Function) secondCallback.call(target);
					return true;
				}
				return false;
			},
			onTouchEnded: function(touch, event) {
				var target = event.getCurrentTarget();
				if (!target.isVisible()) return;
				var pos = target.convertToNodeSpace(touch.getLocation());
				if (cc.rectContainsPoint(cc.rect(0, 0, target.width, target.height), pos)) {
					if (callback instanceof Function) callback.call(target);
				} else {
					if (cancelCallback instanceof Function) cancelCallback.call(target);
				}
			}
		}, this);
	},
	//拖曳
	drag: function(callback, secondCallback) {
		if (secondCallback instanceof Function) {
			var tmpCallback = secondCallback
			secondCallback = callback
			callback = tmpCallback
		}
		cc.eventManager.addListener({
			event: cc.EventListener.TOUCH_ALL_AT_ONCE,
			onTouchesBegan: function(touches, event) {
				var target = event.getCurrentTarget();
				if (!target.isVisible()) return false;
				var pos = target.convertToNodeSpace(touches[0].getLocation());
				if (cc.rectContainsPoint(cc.rect(0, 0, target.width, target.height), pos)) {
					if (secondCallback instanceof Function) secondCallback.call(target);
					return true;
				}
				return false;
			},
			onTouchesMoved: function(touches, event) {
				var target = event.getCurrentTarget();
				if (!target.isVisible()) return;
				var touch = touches[0]
				var delta = touch.getDelta();
				target.x += delta.x;
				target.y += delta.y;
				if (secondCallback instanceof Function) secondCallback.call(target);
			},
			onTouchesEnded: function(touches, event) {
				var target = event.getCurrentTarget();
				if (!target.isVisible()) return;
				if (callback instanceof Function) callback.call(target);
			}
		}, this);
	},
	//缩放
	pinch: function(callback, secondCallback) {
		if (secondCallback instanceof Function) {
			var tmpCallback = secondCallback
			secondCallback = callback
			callback = tmpCallback
		}
		var angle = function(start, end){
			var diff_x = end.x - start.x, diff_y = end.y - start.y;
			return 360 * Math.atan(diff_y/diff_x) / (2*Math.PI);
		}
		cc.eventManager.addListener({
			event: cc.EventListener.TOUCH_ALL_AT_ONCE,
			onTouchesBegan: function(touches, event) {
				if (touches.length < 2) return false;
				var target = event.getCurrentTarget();
				if (!target.isVisible()) return false;
				var pos1 = target.convertToNodeSpace(touches[0].getLocation());
				var pos2 = target.convertToNodeSpace(touches[1].getLocation());
				if (cc.rectContainsPoint(cc.rect(0, 0, target.width, target.height), pos1) && cc.rectContainsPoint(cc.rect(0, 0, target.width, target.height), pos2)) {
					if (secondCallback instanceof Function) secondCallback.call(target);
					return true;
				}
				return false;
			},
			onTouchesMoved: function(touches, event) {
				if (touches.length < 2) return;
				var touch = touches[0];
				var target = event.getCurrentTarget();
				var delta = touch.getDelta();
				var touch1 = touches[1];
				var delta1 = touch1.getDelta();
				var point = touch.getLocation();
				var point1 = touch1.getLocation();
				
				//缩放
				var area = (point.x - point1.x);
				var area1 = (point.x - point1.x + delta.x - delta1.x);
				target.scale = area1 / area * target.scale;
				
				//旋转
				var degree = angle(point, point1);
				point.x += delta.x;
				point1.x += delta1.x;
				point.y += delta.y;
				point1.y += delta1.y;
				var degree1 = angle(point, point1);
				var rota = Math.round(degree - degree1);
				target.rotation = rota + target.rotation;
			}
		}, this);
	},
	//震动
	vibrate: function(duration) {
		window.navigator.vibrate = navigator.vibrate
			|| navigator.webkitVibrate
			|| navigator.mozVibrate
			|| navigator.msVibrate;
		if (window.navigator.vibrate) window.navigator.vibrate(duration);
	},
	//宽高比例缩放
	sizeFit: function(originWidth, originHeight, width, height) {
		if (!height) {
			originHeight = (originHeight * width) / originWidth;
		} else {
			originWidth = (originWidth * height) / originHeight;
		}
		return {width:originWidth, height:originHeight};
	},
	//防内容溢出, this.addChild($.overflow(node))
	overflow: function(node) {
		var offset = node.convertToWorldSpace();
		var size = node.getContentSize();
		var stencil = new cc.DrawNode();
		stencil.drawRect(cc.p(offset.x, offset.y), cc.p(offset.x+size.width, offset.y+size.height), cc.color(0, 0, 0), 1, cc.color(0, 0, 0));
		var clippingPanel = new cc.ClippingNode();
		clippingPanel.stencil = stencil;
		clippingPanel.addChild(node);
		return clippingPanel;
	},
	//圆角, this.addChild($.borderRadius(node, 10)), node裁剪圆角的节点, radius圆角半径, seat位置数组[0左下|1右下|2右上|3左上]
	borderRadius: function(node, radius, seat) {
		var offset = node.convertToWorldSpace();
		var size = node.getContentSize();
		var horizontal = {
			start: cc.p(offset.x, (!seat || this.inArray(0, seat) > -1) ? offset.y+radius : offset.y),
			end: cc.p(offset.x+size.width, (!seat || this.inArray(2, seat) > -1) ? offset.y+size.height-radius : offset.y+size.height)
		};
		var vertical = {
			start: cc.p((!seat || this.inArray(3, seat) > -1) ? offset.x+radius : offset.x, offset.y),
			end: cc.p((!seat || this.inArray(1, seat) > -1) ? offset.x+size.width-radius : offset.x+size.width, offset.y+size.height)
		};
		var stencil = new cc.DrawNode();
		stencil.drawRect(horizontal.start, horizontal.end, cc.color(0, 0, 0), 1, cc.color(0, 0, 0));
		stencil.drawRect(vertical.start, vertical.end, cc.color(0, 0, 0), 1, cc.color(0, 0, 0));
		if (!seat || this.inArray(0, seat) > -1) stencil.drawCircle(cc.p(offset.x+radius, offset.y+radius), radius/3, 0, 100, false, radius, cc.color(0, 0, 0));
		if (!seat || this.inArray(1, seat) > -1) stencil.drawCircle(cc.p(offset.x+size.width-radius, offset.y+radius), radius/3, 0, 100, false, radius, cc.color(0, 0, 0));
		if (!seat || this.inArray(2, seat) > -1) stencil.drawCircle(cc.p(offset.x+size.width-radius, offset.y+size.height-radius), radius/3, 0, 100, false, radius, cc.color(0, 0, 0));
		if (!seat || this.inArray(3, seat) > -1) stencil.drawCircle(cc.p(offset.x+radius, offset.y+size.height-radius), radius/3, 0, 100, false, radius, cc.color(0, 0, 0));
		var clippingPanel = new cc.ClippingNode();
		clippingPanel.stencil = stencil;
		clippingPanel.addChild(node);
		return clippingPanel;
	},
};