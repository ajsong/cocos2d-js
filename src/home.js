var MainLayer = cc.Layer.extend({
	onEnter: function() {
		this._super();
		getEthers();
	},
	ctor: function() {
		this._super();
		var size = cc.winSize;
		var frameSize = cc.view.getFrameSize();
		var frameRatio = frameSize.width / 480;
		
		cc.eventManager.addListener({
			event: cc.EventListener.KEYBOARD,
			onKeyPressed: function(keyCode) {
				if (cc.KEY.r === keyCode) location.reload();
			}
		}, this);
		
		cc.audioEngine.playMusic(resource.home, true);
		
		this.addChild(bgSprite());
		
		var labelText = '摸了个鱼'
		var label = new cc.LabelTTF(labelText, 'zkkl', 70*frameRatio);
		
		var labelLayer = new cc.LayerColor(cc.color(0, 0, 0, 0), label.width, label.height);
		labelLayer.setPosition(size.width/2 - labelLayer.width/2, size.height - labelLayer.height - 110*frameRatio);
		this.addChild(labelLayer, 10);
		$.pinch.call(labelLayer);
		
		var labelShadow = new cc.LabelTTF(labelText, label.fontName, label.fontSize);
		labelShadow.setPosition(labelLayer.width/2, labelLayer.height/2-5*frameRatio);
		labelShadow.enableStroke(cc.color('#000000'), 20);
		labelLayer.addChild(labelShadow);
		
		label.setPosition(labelLayer.width/2, labelLayer.height/2);
		label.fillStyle = cc.color('#000000');
		label.enableStroke(cc.color('#ffffff'), 20);
		labelLayer.addChild(label);
		
		//Sprite图帧动画
		var frameCache = cc.spriteFrameCache;
		frameCache.addSpriteFrames(res.ufo_plist, res.ufo_png);
		var animation = new cc.Animation();
		for (var i = 1; i <= 4; i++) {
			var frameName = 'h' + i + '.png';
			var frame = frameCache.getSpriteFrame(frameName);
			animation.addSpriteFrame(frame);
		}
		animation.setDelayPerUnit(0.15); //设置两个帧播放时间
		animation.setRestoreOriginalFrame(true); //动画执行后还原初始状态
		var action = cc.animate(animation);
		var ufo = new cc.Sprite()
		ufo.setPosition(size.width/2, size.height/2)
		this.addChild(ufo);
		ufo.runAction(cc.repeatForever(action));
		
		//多图片帧动画
		//使用SpriteBatchNode可以让反复加载帧时只渲染一次，只从内存中取出
		/*var sp = new cc.Sprite()
		sp.setPosition(size.width/2, size.height/2)
		var spriteBatchNode = new cc.SpriteBatchNode(res.ufo_png)
		spriteBatchNode.addChild(sp);
		this.addChild(spriteBatchNode);
		var frames = [];
		for (var i = 0; i < 8; i++) {
			var str = 'Effects/fireworks_0000' + i + '.png';
			var frame = frameCache.getSpriteFrame(str);
			frames.push(frame);
		}
		var animation = new cc.Animation(frames, 1/30);
		sp.runAction(cc.animate(animation).repeatForever());*/
		
		var layer = new cc.LayerColor(cc.color(0, 0, 0, 0), 360*frameRatio, 360*frameRatio);
		layer.setPosition(size.width/2-layer.width/2, size.height/2-layer.height/2);
		this.addChild(layer);
		
		var sheeps = []
		var sheepRotation = function() {
			var layerRotate = layer.getRotation();
			layer.setRotation(layerRotate + 1);
			for (var i = 0; i < sheeps.length; i++) {
				var sheepLayer = sheeps[i];
				var sheepRotate = sheepLayer.getRotation();
				if (Math.abs(sheepRotate) >= 360) sheepRotate = 0;
				sheepLayer.setRotation(sheepRotate - 1);
				
				var starAngle = 0, endAngle = 0;
				switch (i) {
					case 0:
						starAngle = 90;
						endAngle = 270;
						break;
					case 1:
						starAngle = 45;
						endAngle = 225;
						break;
					case 2:
						starAngle = 180;
						endAngle = 360;
						break;
					case 3:
						starAngle = 135;
						endAngle = 315;
						break;
				}
				if (Math.abs(sheepRotate) >= starAngle && Math.abs(sheepRotate) <= endAngle) sheepLayer.setScale(0.7*(i<2?-1:1), 0.7);
				else sheepLayer.setScale(-0.7*(i<2?-1:1), 0.7);
				
				var sheep = sheepLayer.getChildByTag(100);
				if (!sheep.move) {
					sheep.move = true;
					sheep.runAction(cc.sequence(cc.rotateTo(0.05, 2), cc.moveBy(0.1, cc.p(0, 10*frameRatio)), cc.rotateTo(0.05, -2), cc.moveBy(0.1, cc.p(0, -10*frameRatio)), cc.rotateTo(0.05, 0), cc.callFunc(function() {
						this.move = false;
					}, sheep)));
				}
				
				var shadow = layer.getChildByTag(200+i)
				if (shadow) shadow.setRotation(sheepRotate - 1);
			}
			setTimeout(function() {
				sheepRotation()
			}, 10);
		}
		
		var radian = (2 * Math.PI / 360) * 45;
		var long = Math.sqrt(Math.pow(layer.width/2, 2) + Math.pow(layer.height/2, 2));
		var w = Math.sin(radian) * (long / 2);
		
		for (var i = 0; i < 4; i++) {
			var sheep = sheepSprite(true);
			
			var sheepLayer = new cc.LayerColor(cc.color(0, 0, 0, 0), sheep.width, sheep.height);
			sheepLayer.setScale(0.7);
			
			var x = 0, y = 0;
			switch (i) {
				case 0:
					x = layer.width/2 - sheepLayer.width*0.7/2;
					y = layer.height - sheepLayer.height*0.7;
					break;
				case 1:
					x = layer.width/2 + w - sheepLayer.width*0.7/2 - 10*frameRatio;
					y = layer.height/2 + w - sheepLayer.height*0.7/2;
					break;
				case 2:
					x = layer.width - sheepLayer.width*0.7 + 10*frameRatio;
					y = layer.height/2 - sheepLayer.height*0.7/2;
					sheepLayer.setScale(-0.7, 0.7);
					break;
				case 3:
					x = layer.width/2 + w - sheepLayer.width*0.7/2;
					y = layer.height/2 - w - sheepLayer.height*0.7/2;
					sheepLayer.setScale(-0.7, 0.7);
					break;
				case 4:
					x = layer.width/2 - sheepLayer.width*0.7/2;
					y = 0;
					sheepLayer.setScale(-0.7, 0.7);
					break;
			}
			sheepLayer.setPosition(x, y);
			layer.addChild(sheepLayer, 1);
			
			sheep.setPosition(sheepLayer.width/2 - sheep.width/2, sheepLayer.height/2 - sheep.height/2);
			sheepLayer.addChild(sheep, 0, 100);
			
			var shadowLayer = new cc.LayerColor(cc.color(0, 0, 0, 0), sheepLayer.width, sheepLayer.height);
			shadowLayer.setPosition(x, y);
			shadowLayer.setScale(0.7*frameRatio);
			layer.addChild(shadowLayer, 0, 200 + i);
			
			var shadow = new cc.Sprite(resource.sheep, cc.rect(113, 23, 126, 17));
			shadow.setPosition(shadowLayer.width/2, -10*frameRatio);
			shadow.setScale(frameRatio)
			shadowLayer.addChild(shadow);
			
			sheeps.push(sheepLayer);
		}
		sheepRotation();
		
		var act = new cc.LayerColor(cc.color(0, 0, 0, 0), 409/2, 164/2);
		act.setPosition(size.width/2 - act.width/2, 100*frameRatio);
		act.setScale(frameRatio)
		this.addChild(act);
		$.tap.call(act, function() {
			$.vibrate(100);
			cc.audioEngine.playEffect(resource.tap);
			this.runAction(cc.sequence(cc.scaleTo(0.2, 0.95*frameRatio), cc.scaleTo(0.2, frameRatio)));
		}, function() {
			cc.director.runScene(new cc.TransitionSlideInR(0.2, new GameScene()));
		});
		
		var button = new cc.Sprite(resource.bg, cc.rect(623, 901, 164, 409));
		button.setRotation(-90);
		button.setScale(0.5);
		button.setAnchorPoint(0, 1);
		act.addChild(button);
		
		var font = new cc.LabelTTF('开始游戏', 'zkkl', 40*frameRatio);
		font.fillStyle = cc.color('#000000');
		font.setPosition(act.width/2 - font.width/2, act.height/2 - font.height/2);
		font.setAnchorPoint(0, 0);
		act.addChild(font);
	},
	wallet: '',
	showWallet: function(wallet, balance) {
		var size = cc.winSize
		var frameSize = cc.view.getFrameSize();
		var frameRatio = frameSize.width / 480;
		this.wallet = wallet
		var label = new cc.LabelTTF('钱包地址：\n'+this.wallet+'\n'+$.bcmul(balance, 1, 8)+' HT', 'DINPro', 18*frameRatio);
		label.setPosition(size.width/2, 50*frameRatio);
		label.enableStroke(cc.color(0, 0, 0), 3*frameRatio);
		this.addChild(label);
	}
})

var MainScene = cc.Scene.extend({
	onEnter: function() {
		this._super();
		var layer = new MainLayer();
		this.addChild(layer);
	}
});
