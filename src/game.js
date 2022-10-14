var GameLayer = cc.Layer.extend({
	singleCount: 50, //单卡牌数, 最终会生成总卡牌数 singleCount * 3
	levels: [0.05, 0.25, 0.35, 0.2, 0.15], //层数与每层卡牌数占比, 占比总和必须为1
	columnCount: 13, //柱子排列数量
	matchCount: 3, //匹配数
	maxCount: 7, //最大槽位
	fixLeft: 2, //槽内卡牌左边间隔距离修复
	presentCount: 3, //提出数量
	history: [], //历史
	moving: false, //是否正在移动
	ctor: function() {
		this._super();
		var _this = this;
		var size = cc.winSize;
		var frameSize = cc.view.getFrameSize();
		var frameRatio = frameSize.width / 480;
		
		cc.eventManager.addListener({
			event: cc.EventListener.KEYBOARD,
			onKeyPressed: function(keyCode) {
				if (cc.KEY.r === keyCode) {
					location.reload();
					return;
				}
				if (cc.KEY.b === keyCode) {
					cc.director.runScene(new cc.TransitionSlideInL(0.2, new MainScene()));
				}
			}
		}, this);
		
		cc.audioEngine.playMusic(resource.bgmLong);
		setTimeout(function(){
			cc.audioEngine.playMusic(resource.bgm, true);
		}, 82000);
		
		this.addChild(bgSprite());
		
		var back = new cc.Sprite(resource.bg, cc.rect(611, 1913, 75, 71));
		back.setScale(0.5);
		back.setPosition(20*frameRatio + back.width/2/2, size.height - 20*frameRatio - back.height/2/2);
		back.setRotation(-90);
		this.addChild(back);
		$.tap.call(back, function() {
			if (_this.moving) return;
			$.vibrate(100);
			this.runAction(cc.sequence(cc.scaleTo(0.2, 0.4), cc.scaleTo(0.2, 0.5)));
		}, function() {
			if (_this.moving) return;
			cc.director.runScene(new cc.TransitionSlideInL(0.2, new MainScene()));
		});
		
		var area = new cc.LayerColor(cc.color(0, 0, 0, 0));
		area.width = 384*frameRatio;
		area.height = area.width;
		area.setPosition(size.width/2-area.width/2, size.height-area.height-50*frameRatio);
		this.addChild(area, 2);
		
		var cardRect = cc.rect(4, 4, 118, 133);
		var shadowRect = cc.rect(4, 145, cardRect.width, cardRect.height);
		var itemWidth = area.width / 7;
		var itemHeight = $.sizeFit(cardRect.width, cardRect.height, itemWidth).height;
		
		var leftList = [];
		var rightList = [];
		var horizontalLeftList = [];
		var horizontalRightList = [];
		var presentList = [];
		var basketList = [];
		
		var items = [];
		for (var i = 0; i < this.singleCount; i++) {
			icons.sort(function() {return 0.5 - Math.random()});
			icons.sort(function() {return 0.5 - Math.random()});
			icons.sort(function() {return 0.5 - Math.random()});
			var index = Math.floor(Math.random() * icons.length);
			var config = icons[index];
			
			for (var k = 0; k < _this.matchCount; k++) {
				var item = new cc.Layer();
				item.index = i * _this.matchCount + k;
				item.key = config.key;
				item.width = itemWidth;
				item.height = itemHeight;
				
				var card = new cc.Sprite(resource.asset, cardRect);
				card.setScale(itemWidth/card.width);
				card.setPosition(itemWidth/2, itemHeight/2);
				item.addChild(card);
				
				var icon = new cc.Sprite(resource.asset, config.rect);
				icon.setScale(itemWidth/icon.width*0.8);
				icon.setPosition(itemWidth/2, itemHeight/2+3);
				item.addChild(icon, 2, 98);
				if (typeof config.rotate !== 'undefined') icon.setRotation(config.rotate);
				if (typeof config.scale !== 'undefined') icon.setScale(icon.scale + config.scale);
				
				var shadow = new cc.Sprite(resource.asset, shadowRect);
				shadow.setScale(itemWidth/card.width);
				shadow.setPosition(itemWidth/2, itemHeight/2);
				shadow.setOpacity(0);
				item.addChild(shadow, 3, 99);
				
				$.tap.call(item, function() {
					if (_this.moving) return;
					var _item = this;
					if (_item.basket) return;
					var above = _item.above || [];
					if (above.length > 0) return;
					
					$.vibrate(100);
					cc.audioEngine.playEffect(resource.tap);
					
					_item.originIndex = _item.getLocalZOrder();
					_item.setLocalZOrder(100);
					_item.runAction(cc.scaleTo(0.2, 1.3));
					
					for (var i = 0; i < presentList.length; i++) {
						if (_item === presentList[i]) {
							presentList.splice(i, 1);
							break;
						}
					}
				}, function() {
					if (_this.moving) return;
					var _item = this;
					if (_item.basket) return;
					var above = _item.above || [];
					if (above.length > 0) return; //上面还有卡牌,终止
					_this.moving = true;
					
					//更新点击卡片覆盖的卡片的上层
					var below = _item.below || [];
					var _below = below;
					for (var i = 0; i < below.length; i++) {
						var card = below[i];
						var aboves = [];
						var above = card.above || [];
						for (var j = 0; j < above.length; j++) {
							if (above[j] !== _item) aboves.push(above[j]);
						}
						card.above = aboves;
						if (aboves.length === 0) {
							card.getChildByTag(98).setVisible(true); //显示图标
							card.getChildByTag(99).runAction(cc.fadeOut(0.2)); //消除暗影
						}
					}
					
					//加到下面的篮子
					var point = area.convertToWorldSpace();
					var basketPoint = basket.convertToWorldSpace();
					
					var p = basketList.length * (itemWidth + _this.fixLeft*frameRatio);
					var index = basketList.length;
					for (var k = basketList.length - 1; k >= 0; k--) {
						var card = basketList[k];
						if (card.key === _item.key) {
							if (k < basketList.length - 1) {
								index = k + 1;
								p = basketList[index].x + 6*frameRatio; //最终到达位置
								//向右移动一格
								for (var i = index; i < basketList.length; i++) {
									var next = basketList[i];
									next.runAction(cc.moveTo(0.2, cc.p(next.x + itemWidth + _this.fixLeft*frameRatio, next.y)));
								}
							}
							break;
						}
					}
					
					_this.history.push({
						item: _item,
						key: _item.key,
						x: _item.x,
						y: _item.y,
						below: _below,
						zIndex: _item.originIndex,
						index: index
					});
					
					var x = basketPoint.x - point.x + 12*frameRatio + p;
					var y = basketPoint.y - point.y + 24*frameRatio;
					
					//动画
					//https://blog.csdn.net/sun124608666/article/details/115675634
					_item.basket = true;
					_item.runAction(cc.spawn(cc.moveTo(0.2, cc.p(x, y)), cc.scaleTo(0.2, 1)));
					
					basketList.splice(index, 0, _item); //增加:索引前面添加, 删除:删除索引
					var itemIndex = $.inArray(_item, items);
					if (itemIndex > -1) items.splice(itemIndex, 1);
					
					if (leftList.length) {
						var index = $.inArray(_item, leftList);
						if (index > -1) leftList.splice(index, 1);
					}
					if (rightList.length) {
						var index = $.inArray(_item, rightList);
						if (index > -1) rightList.splice(index, 1);
					}
					if (horizontalLeftList.length) {
						var index = $.inArray(_item, horizontalLeftList);
						if (index > -1) horizontalLeftList.splice(index, 1);
					}
					if (horizontalRightList.length) {
						var index = $.inArray(_item, horizontalRightList);
						if (index > -1) horizontalRightList.splice(index, 1);
					}
					
					setTimeout(function() {
						//是否满 matchCount 个
						var hasSame = false, prevKey = '', count = 0;
						for (var i = 0; i < basketList.length; i++) {
							var card = basketList[i];
							if (prevKey === card.key) {
								hasSame = true
								count++;
								if (count >= _this.matchCount) {
									for (var k = i; k >= i - 2; k--) {
										var _item = basketList[k];
										var pos = _item.convertToWorldSpace();
										var starSpeed = 0.4, starScale = 0.4;
										for (var s = 0; s < 6; s++) {
											var star = new cc.Sprite(resource.star);
											star.width = 86*frameRatio;
											star.height = 86*frameRatio;
											star.setPosition(pos.x+star.width*starScale, pos.y+star.height*starScale);
											star.setScale(starScale);
											_this.addChild(star, 101);
											var starX1 = star.x - 20*frameRatio, starY1 = star.y - 20*frameRatio, starX2 = star.x + 20*frameRatio, starY2 = star.y + 20*frameRatio;
											star.runAction(cc.sequence(cc.spawn(cc.scaleTo(starSpeed, 0), cc.moveTo(starSpeed, starX1 + Math.random() * (starX2 - starX1), starY1 + Math.random() * (starY2 - starY1))), cc.callFunc(function(){
												star.removeFromParent();
											})));
										}
										_item.runAction(cc.sequence(cc.scaleTo(0.2, 0)));
									}
									for (var k = i + 1; k < basketList.length; k++) {
										var _item = basketList[k];
										_item.runAction(cc.moveTo(0.2, cc.p(_item.x - (itemWidth + _this.fixLeft*frameRatio) * _this.matchCount, _item.y)));
									}
									setTimeout(function(){
										basketList.splice(i - 2, _this.matchCount);
										_this.moving = false;
									}, 210);
									_this.history = [];
									
									//赢
									if (!items.length && !leftList.length && !rightList.length && !horizontalLeftList.length && !horizontalRightList.length) {
										for (var k = 0; k <= 2; k++) {
											var speed = 0.3;
											var button = _this.getChildByTag(200 + k);
											button.runAction(cc.spawn(cc.moveBy(speed, cc.p(0, -20*frameRatio)), cc.fadeOut(speed)));
											button.getChildByTag(97).runAction(cc.fadeOut(speed));
											button.getChildByTag(98).runAction(cc.fadeOut(speed));
											button.getChildByTag(98).getChildByTag(10).runAction(cc.fadeOut(speed));
										}
										_this.moving = true;
										winMask.setVisible(true);
										winMask.getChildByTag(10).setVisible(true);
										winMask.runAction(cc.fadeTo(0.2, 220));
										return;
									}
									
									break;
								}
								setTimeout(function() {_this.moving = false}, 220);
								continue;
							}
							prevKey = card.key;
							count = 1;
						}
						
						if (!hasSame) _this.moving = false;
						
						//输
						setTimeout(function() {
							if (basketList.length >= _this.maxCount) {
								_this.moving = true;
								lostMask.setVisible(true);
								lostMask.getChildByTag(10).setVisible(true);
								lostMask.runAction(cc.fadeTo(0.2, 220));
							}
						}, 230);
					}, 220);
				}, function() {
					if (_this.moving) return;
					var _item = this;
					if (_item.basket) return;
					var above = _item.above || [];
					if (above.length > 0) return;
					
					_item.setLocalZOrder(_item.originIndex);
					_item.runAction(cc.scaleTo(0.2, 1));
				});
				
				items.push(item);
			}
		}
		items.sort(function() {return 0.5 - Math.random()});
		items.sort(function() {return 0.5 - Math.random()});
		items.sort(function() {return 0.5 - Math.random()});
		
		if (Math.random() <= 0.33) {
			for (var i = 0; i < _this.columnCount; i++) {
				leftList.push(items.pop());
				rightList.push(items.pop());
			}
		} else if (Math.random() <= 0.66) {
			for (var i = 0; i < _this.columnCount; i++) {
				horizontalLeftList.push(items.pop());
				horizontalRightList.push(items.pop());
			}
		} else {
			for (var i = 0; i < _this.columnCount; i++) {
				leftList.push(items.pop());
				rightList.push(items.pop());
			}
			for (var i = 0; i < _this.columnCount; i++) {
				horizontalLeftList.push(items.pop());
				horizontalRightList.push(items.pop());
			}
		}
		
		//堆叠排列
		var level = 0, step = 0;
		var levelGroups = [], levelGroup = [];
		var pos = [];
		var xBegin = 0, yBegin = 0, xEnd = 7, yEnd = 6;
		var xIndent = 0, yIndent = 0;
		for (var i = 0; i < items.length; i++) {
			var x = xBegin, y = yBegin;
			var isBreak = 0;
			do {
				if (isBreak >= 50) break;
				x = Math.floor(xBegin + Math.random() * (xEnd - xBegin));
				y = Math.floor(yBegin + Math.random() * (yEnd - yBegin));
				isBreak++;
			} while(
				$.inArray(x + '' + y, pos) > -1 ||
				( level === 0 && ((x === 0 && y === 0) || (x === 0 && y === 5) || (x === 6 && y === 0) || (x === 6 && y === 5)) )
			)
			
			pos.push(x + '' + y);
			x = Math.floor(xIndent + itemWidth * x);
			y = Math.floor(yIndent + (itemHeight - 6*frameRatio) * y);
			
			var item = items[i];
			item.setPosition(x, y);
			area.addChild(item, level);
			levelGroup.push(item);
			
			if (level > 0) {
				var below = [];
				var arr = levelGroups[level - 1];
				for (var k = 0; k < arr.length; k++) {
					var card = arr[k];
					//碰撞检测、矩形相交
					//https://blog.csdn.net/vivi_12/article/details/74973105
					if (cc.rectIntersectsRect(cc.rect(card.x, card.y, card.width, card.height), cc.rect(item.x + 1, item.y + 1, item.width - 2, item.height - 2))) {
						below.push(card);
						card.getChildByTag(99).runAction(cc.fadeIn(0));
						var above = card.above || [];
						above.push(item);
						card.above = above;
					}
				}
				if (below.length) item.below = below;
			}
			
			if (this.levels.length > level) {
				if (Math.floor(items.length * this.levels[level]) === step) {
					step = 0;
					level++;
					levelGroups.push(levelGroup);
					levelGroup = [];
					pos = [];
					if (level > 2) {
						if (Math.random() >= 0.5) {
							xIndent += itemWidth / 2;
							yIndent += (itemHeight - 6*frameRatio) / 2;
							xEnd--;
							yEnd--;
						} else {
							xIndent -= itemWidth / 2;
							yIndent -= (itemHeight - 6*frameRatio) / 2;
							xEnd++;
							yEnd++;
						}
					} else if (level > 0) {
						//金字塔形状堆叠
						xIndent += itemWidth / 2;
						yIndent += (itemHeight - 6*frameRatio) / 2;
						xEnd--;
						yEnd--;
					}
					continue;
				}
				step++;
			}
		}
		levelGroups.push(levelGroup);
		
		//柱子排列
		var point = area.convertToWorldSpace();
		var indent = (leftList.length && horizontalLeftList.length) ? 20*frameRatio : 0;
		
		var leftArea = new cc.LayerColor(cc.color(0, 0, 0, 0), itemWidth, itemHeight + 12*frameRatio * 6);
		leftArea.x = Math.floor(point.x - indent);
		leftArea.y = Math.floor(point.y - leftArea.height - itemHeight/2);
		leftArea.setAnchorPoint(0, 1);
		this.addChild(leftArea);
		
		var rightArea = new cc.LayerColor(cc.color(0, 0, 0, 0), leftArea.width, leftArea.height);
		rightArea.x = Math.floor(point.x + area.width - leftArea.width + indent);
		rightArea.y = Math.floor(leftArea.y);
		rightArea.setAnchorPoint(1, 1);
		this.addChild(rightArea);
		
		var horizontalLeftArea = new cc.LayerColor(cc.color(0, 0, 0, 0), itemWidth + 12*frameRatio * 6, itemHeight);
		horizontalLeftArea.x = Math.floor(leftList.length ? leftArea.x + leftArea.width + 15*frameRatio : point.x - indent);
		horizontalLeftArea.y = Math.floor(leftArea.y + leftArea.height - horizontalLeftArea.height);
		horizontalLeftArea.setAnchorPoint(0, 1);
		this.addChild(horizontalLeftArea);
		
		var horizontalRightArea = new cc.LayerColor(cc.color(0, 0, 0, 0), horizontalLeftArea.width, horizontalLeftArea.height);
		horizontalRightArea.x = Math.floor(leftList.length ? rightArea.x - horizontalLeftArea.width - 15*frameRatio : point.x + area.width - horizontalRightArea.width + indent);
		horizontalRightArea.y = Math.floor(horizontalLeftArea.y);
		horizontalRightArea.setAnchorPoint(1, 1);
		this.addChild(horizontalRightArea);
		
		var areaPoint = area.convertToWorldSpace();
		var setColumnPosition = function(list, i, column, pos) {
			var item = list[i];
			item.column = column;
			item.setPosition(pos.x, pos.y);
			area.addChild(item, 50 + i);
			if (i < list.length - 1){
				item.getChildByTag(98).setVisible(false);
				item.getChildByTag(99).runAction(cc.fadeIn(0));
			}
			if (i > 0) {
				var card = list[i - 1];
				card.above = [item];
				item.below = [card];
			}
		};
		
		if (leftList.length) {
			var list = leftList;
			var _area = leftArea;
			var columnPoint = _area.convertToWorldSpace();
			for (var i = 0; i < list.length; i++) {
				setColumnPosition(list, i, 'left', {
					x: columnPoint.x - areaPoint.x,
					y: columnPoint.y - areaPoint.y + _area.height - itemHeight - i * 6
				});
			}
		} else {
			leftArea.removeFromParent();
		}
		
		if (rightList.length) {
			var list = rightList;
			var _area = rightArea;
			var columnPoint = _area.convertToWorldSpace();
			for (var i = 0; i < list.length; i++) {
				setColumnPosition(list, i, 'right', {
					x: columnPoint.x - areaPoint.x,
					y: columnPoint.y - areaPoint.y + _area.height - itemHeight - i * 6
				});
			}
		} else {
			rightArea.removeFromParent();
		}
		
		if (horizontalLeftList.length) {
			var list = horizontalLeftList;
			var _area = horizontalLeftArea;
			var columnPoint = _area.convertToWorldSpace();
			for (var i = 0; i < list.length; i++) {
				setColumnPosition(list, i, 'horizontalLeft', {
					x: columnPoint.x - areaPoint.x + i * 6,
					y: columnPoint.y - areaPoint.y
				});
			}
		} else {
			horizontalLeftArea.removeFromParent();
		}
		
		if (horizontalRightList.length) {
			var list = horizontalRightList;
			var _area = horizontalRightArea;
			var columnPoint = _area.convertToWorldSpace();
			for (var i = 0; i < list.length; i++) {
				setColumnPosition(list, i, 'horizontalRight', {
					x: columnPoint.x - areaPoint.x + _area.width - itemWidth - i * 6,
					y: columnPoint.y - areaPoint.y
				});
			}
		} else {
			horizontalRightArea.removeFromParent();
		}
		
		//篮子
		var basketArea = new cc.LayerColor(cc.color(0, 0, 0, 0));
		basketArea.width = size.width*frameRatio;
		basketArea.height = 100*frameRatio;
		basketArea.setPosition(size.width/2-basketArea.width/2, 114*frameRatio);
		this.addChild(basketArea, 1);
		
		var basket = new cc.Scale9Sprite(resource.bg, cc.rect(611, 1511, 153, 71));
		basket.setPreferredSize(cc.size(basketArea.height/0.7-10*frameRatio, (basketArea.width-30*frameRatio*2)/0.7));
		basket.setPosition(basketArea.x+30*frameRatio, basketArea.y + 10*frameRatio);
		basket.setRotation(-90);
		basket.setScaleX(0.7);
		basket.setScaleY(-0.7);
		basket.setAnchorPoint(0, 0);
		this.addChild(basket);
		
		var basketAreaY = basketArea.y;
		var railX = 23*frameRatio;
		var rail = new cc.Sprite(resource.bg, cc.rect(160, 1824, 22, 199));
		rail.setScale(0.6*frameRatio);
		rail.setAnchorPoint(0, 0);
		rail.setPosition(basketArea.x+railX, basketAreaY);
		this.addChild(rail);
		
		rail = new cc.Sprite(resource.bg, cc.rect(160, 1824, 22, 199));
		rail.setScale(0.6*frameRatio);
		rail.setAnchorPoint(1, 0);
		rail.setPosition(basketArea.x+basketArea.width - railX, basketAreaY);
		this.addChild(rail);
		
		rail = new cc.Sprite(resource.bg, cc.rect(3, 3, 722, 64));
		rail.setScale(0.6*frameRatio);
		rail.setAnchorPoint(0, 0);
		rail.setPosition(basketArea.x+railX + 1*frameRatio, basketAreaY);
		this.addChild(rail, 100);
		
		var presentArea = new cc.LayerColor(cc.color(0, 0, 0, 0), itemWidth * 3, itemHeight);
		presentArea.setPosition(Math.floor(size.width/2-presentArea.width/2), Math.floor(basketArea.y+basketArea.height+20*frameRatio));
		this.addChild(presentArea);
		
		//道具
		var present = function() {
			var areaPoint = area.convertToWorldSpace();
			var presentPoint = presentArea.convertToWorldSpace();
			var x = presentPoint.x - areaPoint.x;
			var _presentList = presentList.slice();
			for (var i = 0; i < _this.presentCount; i++) {
				var belowCount = 0;
				var item = basketList.shift();
				item.setLocalZOrder(1);
				item.basket = false;
				item.below = []
				
				var below = [];
				for (var k = 0; k < _presentList.length; k++) {
					var card = _presentList[k];
					if (cc.rectIntersectsRect(cc.rect(card.x, card.y, card.width, card.height), cc.rect(x + 1, presentPoint.y - areaPoint.y + 1, item.width - 2, item.height - 2))) {
						below.push(card);
						card.getChildByTag(99).runAction(cc.fadeIn(0.2));
						var above = card.above || [];
						above.push(item);
						card.above = above;
						belowCount++;
					}
				}
				if (below.length) item.below = below;
				var y = presentPoint.y - areaPoint.y + belowCount * 6;
				
				item.runAction(cc.moveTo(0.2, cc.p(x, y)));
				presentList.push(item);
				x += itemWidth;
			}
			//向左移动 presentCount 格
			for (var i = 0; i < basketList.length; i++) {
				var next = basketList[i];
				next.runAction(cc.moveTo(0.2, cc.p(next.x - (itemWidth + _this.fixLeft*frameRatio) * _this.presentCount, next.y)));
			}
			_this.history = [];
			setTimeout(function() {_this.moving = false}, 220);
		};
		
		var gapStart = (480 - size.width*frameRatio) / 2
		var gap = (480*frameRatio - 149*frameRatio * 0.6 * 3) / 4;
		var buttonWidth = 149*frameRatio * 0.6, buttonHeight = 124*frameRatio * 0.6;
		var buttonKey = ['present', 'history', 'refresh'];
		var iconRect = [cc.rect(484, 1023, 135, 117), cc.rect(473, 1146, 127, 115), cc.rect(484, 780, 137, 116)];
		
		for (var i = 0; i < buttonKey.length; i++) {
			var button = new cc.Sprite(resource.bg, cc.rect(160, 1695, 149, 124));
			button.key = buttonKey[i];
			button.setPosition(gapStart + gap * (i + 1) + buttonWidth/2 + buttonWidth * i, 20*frameRatio + buttonHeight/2 - 20*frameRatio);
			button.setScale(0.6*frameRatio);
			button.setOpacity(0);
			this.addChild(button, 0, 200 + i);
			
			var icon = new cc.Sprite(resource.bg, iconRect[i]);
			icon.setScale(0.6);
			icon.setRotation(-90);
			icon.setPosition(button.width/2, button.height/2 + 10*frameRatio);
			icon.setOpacity(0);
			button.addChild(icon, 0, 97);
			
			var shadow = new cc.Sprite(resource.shadow);
			shadow.setContentSize(button.getContentSize());
			shadow.setPosition(button.width/2, button.height/2);
			shadow.setOpacity(0);
			button.addChild(shadow, 0, 99);
			
			var cross = new cc.Sprite(resource.bg, cc.rect(731, 1631, 47, 44));
			cross.setRotation(-90);
			cross.setAnchorPoint(1, 1);
			cross.setPosition(button.width - 25*frameRatio, button.height + 10*frameRatio);
			cross.setOpacity(0);
			button.addChild(cross, 0, 98);
			
			var plus = new cc.LabelTTF('+', 'Arial', 34*frameRatio);
			plus.setPosition(cross.width/2 + frameRatio, cross.height/2 - 3*frameRatio);
			plus.fillStyle = cc.color('#ffffff');
			plus.setOpacity(0);
			cross.addChild(plus, 0, 10);
			
			var speed = 0.3;
			button.runAction(cc.spawn(cc.moveBy(speed, cc.p(0, 20*frameRatio)), cc.fadeIn(speed)));
			icon.runAction(cc.fadeIn(speed));
			cross.runAction(cc.fadeIn(speed));
			plus.runAction(cc.fadeIn(speed));
			
			$.tap.call(button, function() {
				$.vibrate(100);
				this.runAction(cc.sequence(cc.scaleTo(0.1, 0.55*frameRatio), cc.scaleTo(0.1, 0.6*frameRatio)));
			}, function() {
				if (_this.moving) return;
				_this.moving = true;
				switch (this.key) {
					case 'present':
						if (basketList.length >= _this.presentCount) present();
						else _this.moving = false;
						break;
					case 'history':
						if (!_this.history.length) {
							_this.moving = false;
							return;
						}
						var hisotry = _this.history.pop();
						hisotry.item.runAction(cc.moveTo(0.2, cc.p(hisotry.x + itemWidth + 2*frameRatio, hisotry.y)));
						hisotry.item.basket = false;
						//向左移动一格
						for (var i = hisotry.index; i < basketList.length; i++) {
							var next = basketList[i];
							next.runAction(cc.moveTo(0.2, cc.p(next.x - (itemWidth + _this.fixLeft*frameRatio), next.y)));
						}
						if (!hisotry.item.column) {
							for (var i = 0; i < hisotry.below.length; i++) {
								var card = hisotry.below[i];
								var above = card.above || [];
								above.push(hisotry.item);
								card.above = above;
								card.getChildByTag(99).runAction(cc.fadeIn(0.2));
							}
							items.push(hisotry.item);
						} else if (hisotry.item.column === 'left') {
							var card = leftList[leftList.length-1];
							setTimeout(function() {card.getChildByTag(98).setVisible(false)}, 200);
							card.getChildByTag(99).runAction(cc.fadeIn(0.2));
							card.above = [hisotry.item];
							hisotry.item.below = [card];
							leftList.push(hisotry.item);
						} else if (hisotry.item.column === 'right') {
							var card = rightList[rightList.length-1];
							setTimeout(function() {card.getChildByTag(98).setVisible(false)}, 200);
							card.getChildByTag(99).runAction(cc.fadeIn(0.2));
							card.above = [hisotry.item];
							hisotry.item.below = [card];
							rightList.push(hisotry.item);
						} else if (hisotry.item.column === 'horizontalLeft') {
							var card = horizontalLeftList[horizontalLeftList.length-1];
							setTimeout(function() {card.getChildByTag(98).setVisible(false)}, 200);
							card.getChildByTag(99).runAction(cc.fadeIn(0.2));
							card.above = [hisotry.item];
							hisotry.item.below = [card];
							horizontalLeftList.push(hisotry.item);
						} else if (hisotry.item.column === 'horizontalRight') {
							var card = horizontalRightList[horizontalRightList.length-1];
							setTimeout(function() {card.getChildByTag(98).setVisible(false)}, 200);
							card.getChildByTag(99).runAction(cc.fadeIn(0.2));
							card.above = [hisotry.item];
							hisotry.item.below = [card];
							horizontalRightList.push(hisotry.item);
						}
						setTimeout(function() {
							basketList.splice(hisotry.index, 1);
							hisotry.item.setLocalZOrder(hisotry.zIndex);
							_this.moving = false;
						}, 220);
						break;
					case 'refresh':
						var children = area.getChildren();
						var itemList = [], list = [];
						for (var i = 0; i < children.length; i++) {
							var item = children[i];
							var convert = item.convertToWorldSpace();
							if (cc.rectIntersectsRect(cc.rect(area.x, area.y, area.width, area.height), cc.rect(convert.x, convert.y, item.width, item.height))) {
								itemList.push(item);
								list.push({
									x: item.x,
									y: item.y,
									zIndex: item.getLocalZOrder()
								});
							}
						}
						if (!itemList.length && !leftList.length && !rightList.length && !horizontalLeftList.length && !horizontalRightList.length) {
							_this.moving = false;
							return;
						}
						
						itemList.sort(function() {return 0.5 - Math.random()});
						itemList.sort(function() {return 0.5 - Math.random()});
						itemList.sort(function() {return 0.5 - Math.random()});
						for (var i = 0; i < itemList.length; i++) {
							var item = itemList[i];
							item.above = [];
							item.below = [];
							item.setLocalZOrder(list[i].zIndex);
							item.runAction(cc.moveTo(0.3, list[i].x, list[i].y));
						}
						setTimeout(function() {
							itemList.sort(function(item1, item2) {return item1.getLocalZOrder() - item2.getLocalZOrder()});
							var levelGroups = [], levelGroup = [], prevLevel = 0;
							for (var i = 0; i < itemList.length; i++) {
								var item = itemList[i];
								item.getChildByTag(99).runAction(cc.fadeOut(0.2));
								levelGroup.push(item);
								var level = item.getLocalZOrder();
								
								if (level > 0) {
									var below = [];
									var arr = levelGroups[level - 1];
									for (var k = 0; k < arr.length; k++) {
										var card = arr[k];
										if (cc.rectIntersectsRect(cc.rect(card.x, card.y, card.width, card.height), cc.rect(item.x + 1, item.y + 1, item.width - 2, item.height - 2))) {
											below.push(card);
											card.getChildByTag(99).runAction(cc.fadeIn(0.2));
											var above = card.above || [];
											above.push(item);
											card.above = above;
										}
									}
									if (below.length) item.below = below;
								}
								
								if (i < itemList.length - 1 && level !== itemList[i + 1].getLocalZOrder()) {
									levelGroups.push(levelGroup);
									levelGroup = [];
								}
								
								prevLevel = level;
							}
							levelGroups.push(levelGroup);
							
							_this.moving = false;
						}, 320);
						
						var setColumnPosition = function(parentList) {
							var itemList = [], list = [];
							for (var i = 0; i < parentList.length; i++) {
								var item = parentList[i];
								item.getChildByTag(98).setVisible(true);
								item.getChildByTag(99).runAction(cc.fadeOut(0));
								itemList.push(item);
								list.push({
									x: item.x,
									y: item.y,
									zIndex: item.getLocalZOrder()
								});
							}
							itemList.sort(function() {return 0.5 - Math.random()});
							itemList.sort(function() {return 0.5 - Math.random()});
							itemList.sort(function() {return 0.5 - Math.random()});
							for (var i = 0; i < itemList.length; i++) {
								var item = itemList[i];
								item.above = [];
								item.below = [];
								item.setLocalZOrder(list[i].zIndex);
								item.getChildByTag(98).setVisible(true);
								item.getChildByTag(99).runAction(cc.fadeOut(0));
							}
							for (var i = 0; i < itemList.length; i++) {
								var item = itemList[i];
								item.runAction(cc.moveTo(0.3, list[i].x, list[i].y));
								if (i < itemList.length - 1){
									item.getChildByTag(98).setVisible(false);
									item.getChildByTag(99).runAction(cc.fadeIn(0));
								}
								if (i > 0) {
									var card = itemList[i - 1];
									card.above = [item];
									item.below = [card];
								}
							}
							return itemList;
						}
						if (leftList.length) {
							leftList = setColumnPosition(leftList);
						}
						if (rightList.length) {
							rightList = setColumnPosition(rightList);
						}
						if (horizontalLeftList.length) {
							horizontalLeftList = setColumnPosition(horizontalLeftList);
						}
						if (horizontalRightList.length) {
							horizontalRightList = setColumnPosition(horizontalRightList);
						}
						
						_this.history = [];
				}
			});
		}
		
		//输提示
		var lostMask = new cc.LayerColor(cc.color(0, 0, 0, 220));
		lostMask.width = size.width;
		lostMask.height = size.height;
		lostMask.setOpacity(0);
		lostMask.setVisible(false);
		this.addChild(lostMask, 400);
		
		var frame = new cc.Scale9Sprite(resource.bg, cc.rect(4, 1278, 308, 100));
		frame.setPreferredSize(cc.size(280*frameRatio, 90*frameRatio));
		frame.setPosition(size.width/2, size.height/2 + 200*frameRatio);
		lostMask.addChild(frame);
		
		var tips = new cc.LabelTTF('槽位已满', 'zkkl', 40*frameRatio);
		tips.setPosition(frame.width/2, frame.height/2+3*frameRatio);
		tips.fillStyle = cc.color('#ff0000');
		frame.addChild(tips);
		
		var sheep = new cc.Sprite(resource.bg, cc.rect(602, 1315, 170, 193));
		sheep.setRotation(-90);
		sheep.setPosition(size.width/2, size.height/2);
		lostMask.addChild(sheep);
		
		var button = new cc.Sprite(resource.bg, cc.rect(4, 1488, 308, 101));
		button.setScale(0.8*frameRatio);
		button.setPosition(size.width/2, size.height/2 - 200*frameRatio);
		button.setVisible(false);
		lostMask.addChild(button, 0, 10);
		$.tap.call(button, function() {
			$.vibrate(100);
			cc.audioEngine.playEffect(resource.tap);
			this.runAction(cc.sequence(cc.scaleTo(0.1, 0.7*frameRatio), cc.scaleTo(0.1, 0.8*frameRatio)));
		}, function() {
			cc.director.runScene(new GameScene());
		});
		
		var font = new cc.LabelTTF('重新挑战', 'zkkl', 40);
		font.fillStyle = cc.color('#000000');
		font.setPosition(button.width/2, button.height/2 + 3*frameRatio);
		button.addChild(font);
		
		//赢提示
		var winMask = new cc.LayerColor(cc.color(0, 0, 0, 220));
		winMask.width = size.width;
		winMask.height = size.height;
		winMask.setOpacity(0);
		winMask.setVisible(false);
		this.addChild(winMask, 400);
		
		frame = new cc.Scale9Sprite(resource.bg, cc.rect(4, 1278, 308, 100));
		frame.setPreferredSize(cc.size(280*frameRatio, 90*frameRatio));
		frame.setPosition(size.width/2, size.height/2 + 300*frameRatio);
		winMask.addChild(frame);
		
		tips = new cc.LabelTTF('恭喜你', 'zkkl', 40*frameRatio);
		tips.setPosition(frame.width/2, frame.height/2 + 3*frameRatio);
		tips.fillStyle = cc.color('#f3dd4b');
		frame.addChild(tips);
		
		var sun = new cc.Sprite(resource.grass, cc.rect(0, 405-291, 297, 291));
		sun.setPosition(size.width/2, size.height/2);
		winMask.addChild(sun);
		sun.runAction(cc.repeatForever(cc.sequence(cc.rotateTo(4, 180), cc.rotateTo(4, 360))));
		
		sheep = winSheep();
		sheep.setPosition(size.width/2-sheep.width/2, size.height/2-sheep.height/2);
		sheep.setScale(0.8);
		winMask.addChild(sheep, 1);
		
		var shadowLayer = new cc.LayerColor(cc.color(0, 0, 0, 0), sheep.width, sheep.height);
		shadowLayer.setPosition(sheep.getPosition());
		shadowLayer.setScale(0.7);
		winMask.addChild(shadowLayer, 0);
		
		var shadow = new cc.Sprite(resource.sheeps, cc.rect(577, 10, 17, 126));
		shadow.setRotation(90);
		shadow.setPosition(shadowLayer.width/2-shadow.width/2, -20*frameRatio);
		shadow.setAnchorPoint(1, 0.5);
		shadowLayer.addChild(shadow);
		
		button = new cc.Sprite(resource.bg, cc.rect(4, 1488, 308, 101));
		button.setScale(0.8*frameRatio);
		button.setPosition(size.width/2, size.height/2 - 300*frameRatio);
		button.setVisible(false);
		winMask.addChild(button, 0, 10);
		$.tap.call(button, function() {
			$.vibrate(100);
			cc.audioEngine.playEffect(resource.tap);
			this.runAction(cc.sequence(cc.scaleTo(0.1, 0.7*frameRatio), cc.scaleTo(0.1, 0.8*frameRatio)));
		}, function() {
			cc.director.runScene(new GameScene());
		});
		
		font = new cc.LabelTTF('重新挑战', 'zkkl', 40);
		font.fillStyle = cc.color('#000000');
		font.setPosition(button.width/2, button.height/2 + 3*frameRatio);
		button.addChild(font);
	}
});

var winSheep = function() {
	var sheep = new cc.LayerColor(cc.color(0, 0, 0, 0));
	sheep.width = 152;
	sheep.height = 125;
	
	var body = new cc.Sprite(resource.sheeps, cc.rect(263, 268, sheep.height, sheep.width));
	body.setPosition(sheep.width/2, sheep.height/2);
	body.setRotation(90);
	
	sheep.addChild(body, 1);
	
	var head = new cc.LayerColor(cc.color(0, 0, 0, 0));
	head.width = 91;
	head.height = 132;
	head.setPosition(80, -20);
	head.setAnchorPoint(0.2, 0);
	sheep.addChild(head, 2, 10);
	
	var face = new cc.Sprite(resource.sheeps, cc.rect(522, 138, head.width, head.height));
	face.setPosition(0, 0);
	face.setAnchorPoint(0, 0);
	head.addChild(face, 1);
	
	var footRect = cc.rect(523, 118, 22, 18);
	var foot = new cc.Sprite(resource.sheeps, footRect);
	foot.setRotation(90);
	foot.setAnchorPoint(0, 0.5);
	foot.setPosition(45, 15);
	sheep.addChild(foot, 1);
	
	foot = new cc.Sprite(resource.sheeps, footRect);
	foot.setRotation(90);
	foot.setAnchorPoint(0, 0.5);
	foot.setPosition(60, 15);
	sheep.addChild(foot, 0);
	
	foot = new cc.Sprite(resource.sheeps, footRect);
	foot.setRotation(90);
	foot.setAnchorPoint(0, 0.5);
	foot.setPosition(sheep.width - 60, 15);
	sheep.addChild(foot, 1);
	
	foot = new cc.Sprite(resource.sheeps, footRect);
	foot.setRotation(90);
	foot.setAnchorPoint(0, 0.5);
	foot.setPosition(sheep.width - 45, 15);
	sheep.addChild(foot, 0);
	
	return sheep;
};

var GameScene = cc.Scene.extend({
	onEnter: function() {
		this._super();
		var layer = new GameLayer();
		this.addChild(layer);
	}
});
