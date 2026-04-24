export const ALL_ITEMS = [
  { id: 1,  name: '攀藤植物',     emoji: '🪴' },
  { id: 2,  name: 'Y字型的樹枝',  emoji: '🌿' },
  { id: 3,  name: '螞蟻',         emoji: '🐜' },
  { id: 4,  name: '樹洞',         emoji: '⚫' },
  { id: 5,  name: '蝴蝶',         emoji: '🦋' },
  { id: 6,  name: '枯木',         emoji: '🪵' },
  { id: 7,  name: '甲蟲',         emoji: '🪲' },
  { id: 8,  name: '青苔/苔蘚',    emoji: '🟩' },
  { id: 9,  name: '野莓/果實',    emoji: '🍒' },
  { id: 10, name: '松果',         emoji: '🌲' },
  { id: 11, name: '蜘蛛網',       emoji: '🕸️' },
  { id: 12, name: '蘑菇',         emoji: '🍄' },
  { id: 13, name: '蝸牛',         emoji: '🐌' },
  { id: 14, name: '蜥蜴',         emoji: '🦎' },
  { id: 15, name: '鳥巢',         emoji: '🪺' },
  { id: 16, name: '羽毛',         emoji: '🪶' },
  { id: 17, name: '河流/小溪',    emoji: '💧' },
  { id: 18, name: '石頭',         emoji: '🪨' },
  { id: 19, name: '落葉',         emoji: '🍂' },
  { id: 20, name: '蜜蜂',         emoji: '🐝' },
  { id: 21, name: '蜻蜓',         emoji: '🪁' },
  { id: 22, name: '青蛙',         emoji: '🐸' },
  { id: 23, name: '特殊顏色的花', emoji: '🌸' },
  { id: 24, name: '樹根',         emoji: '🌳' },
  { id: 25, name: '藤蔓',         emoji: '🌱' },
  { id: 26, name: '竹子',         emoji: '🎋' },
  { id: 27, name: '蕨類植物',     emoji: '🌿' },
  { id: 28, name: '蜈蚣',         emoji: '🐛' },
  { id: 29, name: '小鳥',         emoji: '🐦' },
  { id: 30, name: '彩虹',         emoji: '🌈' },
];

export function getRandomGrid() {
  const shuffled = [...ALL_ITEMS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 9).map(item => ({
    ...item,
    status: 'empty',
    photoData: null,
    activityId: null,
  }));
}
