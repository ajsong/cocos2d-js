var resource = {
	zkkl : {
		type: 'font',
	    name: 'zkkl',
	    srcs: ['res/font/zkkl.ttf']
    },
	DINPro : {
		type: 'font',
	    name: 'DINPro',
	    srcs: ['res/font/DINPro-Bold.otf']
    },
    asset : 'res/asset.png',
    bg : 'res/bg.png',
	sheep : 'res/sheep.png',
	sheeps : 'res/sheeps.png',
	shadow : 'res/shadow.png',
	star : 'res/star.png',
	grass : 'res/grass.png',
	home : 'res/music/home.mp3',
    bgmLong : 'res/music/bgm_long.mp3',
    bgm : 'res/music/bgm.mp3',
    tap : 'res/music/tap.mp3',
    ufo_png : 'res/ufo.png',
};

var g_resources = [];
for (var i in resource) {
    g_resources.push(resource[i]);
}

var _api_root = location.href;
