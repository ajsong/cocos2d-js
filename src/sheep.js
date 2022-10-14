var sheepSprite = function(animate) {
	var frameSize = cc.view.getFrameSize();
	var frameRatio = frameSize.width / 480;
	
	var sheep = new cc.LayerColor(cc.color(0, 0, 0, 0));
	sheep.width = 152;
	sheep.height = 125;
	sheep.setScale(frameRatio)
	
	var body = new cc.Sprite(resource.sheep, cc.rect(113, 42, sheep.height, sheep.width));
	body.setPosition(sheep.width/2, sheep.height/2);
	body.setRotation(90);
	
	sheep.addChild(body, 1);
	
	var head = new cc.LayerColor(cc.color(0, 0, 0, 0));
	head.width = 69;
	head.height = 85;
	head.setPosition(100, 5);
	head.setAnchorPoint(0.2, 0);
	sheep.addChild(head, 2, 10);
	
	var face = new cc.Sprite(resource.sheep, cc.rect(200, 227, head.width, head.height));
	face.setPosition(0, 0);
	face.setAnchorPoint(0, 0);
	head.addChild(face, 1);
	
	var ear = new cc.Sprite(resource.sheep, cc.rect(271, 272, 27, 41));
	ear.setAnchorPoint(1, 1);
	ear.setPosition(10, head.height-20);
	head.addChild(ear, 2);
	if (animate) ear.runAction(cc.repeatForever(cc.sequence(cc.rotateTo(0.1, -10), cc.rotateTo(0.1, 0), cc.delayTime(0.1))));
	
	ear = new cc.Sprite(resource.sheep, cc.rect(271, 229, 26, 41));
	ear.setAnchorPoint(0, 1);
	ear.setPosition(head.width-15, head.height-20);
	head.addChild(ear, 0);
	if (animate) ear.runAction(cc.repeatForever(cc.sequence(cc.rotateTo(0.1, 10), cc.rotateTo(0.1, 0), cc.delayTime(0.1))));
	
	var footRect = cc.rect(202, 206, 28, 18);
	var foot = new cc.Sprite(resource.sheep, footRect);
	foot.setRotation(90);
	foot.setAnchorPoint(0, 0.5);
	foot.setPosition(40, 15);
	sheep.addChild(foot, 1);
	
	foot = new cc.Sprite(resource.sheep, footRect);
	foot.setRotation(90);
	foot.setAnchorPoint(0, 0.5);
	foot.setPosition(55, 15);
	sheep.addChild(foot, 0);
	
	foot = new cc.Sprite(resource.sheep, footRect);
	foot.setRotation(90);
	foot.setAnchorPoint(0, 0.5);
	foot.setPosition(sheep.width-60, 15);
	sheep.addChild(foot, 1);
	
	foot = new cc.Sprite(resource.sheep, footRect);
	foot.setRotation(90);
	foot.setAnchorPoint(0, 0.5);
	foot.setPosition(sheep.width-45, 15);
	sheep.addChild(foot, 0);
	
	return sheep;
};