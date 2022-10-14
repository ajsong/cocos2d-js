var glassSprite = function(x, y, isBig) {
	var size = cc.winSize;
	var frameSize = cc.view.getFrameSize();
	var frameRatio = frameSize.width / 480;
	var rect = cc.rect(201, 69, 30, 35);
	if (isBig) rect = cc.rect(130, 3, 53, 29);
	var glass = new cc.Sprite(resource.grass, rect);
	glass.setPosition(x, y);
	glass.setAnchorPoint(0.5, 0);
	glass.setScale(0.6*frameRatio);
	glass.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(0.02, 0.6*frameRatio, 0.8*frameRatio), cc.scaleTo(0.02, 0.6*frameRatio, 0.6*frameRatio), cc.delayTime(0.5))));
	return glass;
};

var bgSprite = function() {
	var size = cc.winSize;
	
	var bg = new cc.LayerColor(cc.color('#d5fe9a'), size.width, size.height);
	bg.setPosition(0, 0);
	bg.setAnchorPoint(0, 0);
	
	bg.addChild(glassSprite(370, 960, true));
	bg.addChild(glassSprite(375, 839, true));
	bg.addChild(glassSprite(108, 791, true));
	bg.addChild(glassSprite(372, 704, true));
	bg.addChild(glassSprite(82, 605, true));
	bg.addChild(glassSprite(171, 548, true));
	bg.addChild(glassSprite(447, 535, true));
	bg.addChild(glassSprite(377, 456, true));
	bg.addChild(glassSprite(32, 433, true));
	bg.addChild(glassSprite(140, 388, true));
	bg.addChild(glassSprite(336, 352, true));
	bg.addChild(glassSprite(224, 229, true));
	bg.addChild(glassSprite(280, 1012));
	bg.addChild(glassSprite(120, 960));
	bg.addChild(glassSprite(284, 728));
	bg.addChild(glassSprite(40, 662));
	bg.addChild(glassSprite(66, 340));
	bg.addChild(glassSprite(444, 333));
	bg.addChild(glassSprite(162, 162));
	bg.addChild(glassSprite(370, 160));
	
	return bg;
};