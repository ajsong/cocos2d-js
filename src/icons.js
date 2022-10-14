var icons = [
	//{key:'树', rect:cc.rect(128, 2, 104, 104)},
	//{key:'帽子', rect:cc.rect(236, 2, 105, 97)},
	//{key:'兔子', rect:cc.rect(345, 2, 102, 96)},
	{key:'裁刀', rect:cc.rect(451, 2, 99, 96), rotate:-90},
	{key:'叉子', rect:cc.rect(554, 2, 101, 94), rotate:-90},
	//{key:'栗子', rect:cc.rect(659, 2, 101, 93)},
	{key:'手套', rect:cc.rect(764, 2, 102, 90), rotate:-90},
	{key:'铃铛', rect:cc.rect(870, 2, 98, 88)}, //8
	
	//{key:'剪刀', rect:cc.rect(125, 143, 104, 104)},
	//{key:'杯', rect:cc.rect(235, 112, 98, 105), rotate:-90},
	//{key:'月亮', rect:cc.rect(336, 104, 98, 100), rotate:-90},
	//{key:'蟹', rect:cc.rect(438, 104, 104, 92)},
	//{key:'十字架', rect:cc.rect(546, 104, 106, 89), rotate:-90},
	//{key:'饭', rect:cc.rect(658, 101, 106, 88)},
	//{key:'谏', rect:cc.rect(766, 96, 98, 91)},
	//{key:'蒜头', rect:cc.rect(869, 96, 97, 91), rotate:-90}, //16
	
	//{key:'爪', rect:cc.rect(2, 282, 104, 108)},
	//{key:'棕月饼', rect:cc.rect(110, 282, 99, 110)},
	//{key:'戒指', rect:cc.rect(213, 253, 95, 108)},
	//{key:'项链', rect:cc.rect(312, 219, 99, 99)},
	//{key:'烟斗', rect:cc.rect(415, 207, 94, 102), rotate:-90},
	{key:'水桶', rect:cc.rect(513, 198, 97, 98), rotate:-90},
	//{key:'内裤', rect:cc.rect(614, 195, 108, 87)},
	//{key:'笔记', rect:cc.rect(728, 192, 100, 89)},
	{key:'白菜', rect:cc.rect(832, 192, 98, 88), rotate:-90}, //25
	
	//{key:'棒子', rect:cc.rect(4, 394, 104, 108)},
	//{key:'肉', rect:cc.rect(112, 396, 102, 106)},
	//{key:'胸围', rect:cc.rect(216, 365, 92, 110), rotate:-90},
	//{key:'香炉', rect:cc.rect(312, 322, 96, 101)},
	//{key:'白月饼', rect:cc.rect(412, 322, 105, 92), rotate:-90},
	{key:'羊毛', rect:cc.rect(521, 300, 96, 98)},
	//{key:'孔明灯', rect:cc.rect(623, 288, 87, 105)},
	//{key:'弩', rect:cc.rect(714, 288, 86, 105), rotate:-90, scale:-0.05},
	{key:'萝卜', rect:cc.rect(803, 287, 94, 94)},
	//{key:'血', rect:cc.rect(900, 284, 104, 78), rotate:-90}, //35
	
	//{key:'花', rect:cc.rect(2, 506, 104, 107)},
	//{key:'符', rect:cc.rect(111, 506, 102, 106)},
	//{key:'花鞋', rect:cc.rect(218, 479, 100, 101), rotate:-90},
	//{key:'砵', rect:cc.rect(218, 479, 94, 103), rotate:-90},
	//{key:'秘笈', rect:cc.rect(420, 418, 88, 107)},
	//{key:'苹果', rect:cc.rect(510, 418, 97, 97)},
	//{key:'爱心', rect:cc.rect(611, 403, 88, 104), rotate:-90},
	{key:'绿草', rect:cc.rect(703, 395, 91, 100), rotate:-90},
	//{key:'灰树桩', rect:cc.rect(798, 395, 89, 100), rotate:-90},
	//{key:'油灯', rect:cc.rect(891, 383, 79, 106), scale:-0.1}, //45
	
	//{key:'南瓜头', rect:cc.rect(2, 617, 102, 108), rotate:-90},
	//{key:'粉月饼', rect:cc.rect(108, 617, 99, 111)},
	//{key:'高帽', rect:cc.rect(211, 616, 103, 104)},
	//{key:'面具', rect:cc.rect(318, 584, 95, 106), rotate:-90},
	//{key:'蓝火', rect:cc.rect(419, 536, 88, 107)},
	{key:'火', rect:cc.rect(511, 531, 88, 107), scale:-0.05},
	//{key:'小刀', rect:cc.rect(601, 520, 96, 101)},
	{key:'树桩', rect:cc.rect(795, 499, 89, 100), rotate:-90},
	//{key:'毛笔', rect:cc.rect(889, 499, 90, 94)}, //54
	
	//{key:'红花', rect:cc.rect(2, 730, 102, 109)},
	//{key:'黄月饼', rect:cc.rect(108, 732, 110, 99), rotate:-90},
	//{key:'一束花', rect:cc.rect(221, 726, 101, 104)},
	//{key:'桂花酒', rect:cc.rect(327, 694, 92, 109), scale:-0.05},
	{key:'毛刷', rect:cc.rect(515, 640, 96, 97)},
	{key:'毛兰', rect:cc.rect(710, 616, 94, 94), rotate:-90},
	//{key:'阴阳', rect:cc.rect(808, 603, 92, 92)},
	//{key:'摇铃', rect:cc.rect(904, 598, 105, 70), rotate:-90}, //62
	
	//{key:'南瓜', rect:cc.rect(2, 845, 104, 105), rotate:-90},
	//{key:'月饼', rect:cc.rect(110, 835, 99, 110)},
	//{key:'绿月饼', rect:cc.rect(213, 835, 99, 110)},
	//{key:'蜜蜂', rect:cc.rect(318, 835, 100, 106)},
	//{key:'红印', rect:cc.rect(420, 807, 98, 102), rotate:-90},
	//{key:'青草', rect:cc.rect(522, 741, 91, 100), rotate:-90},
	//{key:'铜钱', rect:cc.rect(617, 723, 95, 95)},
	{key:'玉米', rect:cc.rect(716, 713, 93, 95)},
	//{key:'蜡烛', rect:cc.rect(813, 699, 74, 102), scale:-0.1},
	//{key:'毛笔托', rect:cc.rect(891, 699, 109, 68)}, //72
	
	//{key:'高跟鞋', rect:cc.rect(626, 822, 102, 83)},
	//{key:'男', rect:cc.rect(731, 812, 87, 87)},
	//{key:'毛笔桶', rect:cc.rect(822, 805, 103, 73), rotate:-90},
	{key:'牛奶', rect:cc.rect(930, 771, 64, 98), scale:-0.15}, //76
	
	//{key:'烛台', rect:cc.rect(110, 949, 108, 66), rotate:-90},
	//{key:'女', rect:cc.rect(222, 951, 101, 65), rotate:-90},
	//{key:'嘴唇', rect:cc.rect(327, 946, 108, 69)},
	//{key:'梨子', rect:cc.rect(439, 913, 106, 93), rotate:-90},
	//{key:'礼物', rect:cc.rect(549, 913, 94, 94)},
	{key:'干草', rect:cc.rect(649, 909, 76, 106), scale:-0.13},
	//{key:'圣水', rect:cc.rect(727, 909, 74, 106), scale:-0.1},
	//{key:'红酒', rect:cc.rect(883, 882, 103, 70), rotate:-90}, //84
];
