/*! HCY character-library injector — char-001…062 from index.csv */
(function(global){
'use strict';
var CHARS = [{"id":"char-001","file":"png/char-001.png","role":"warrior","colors":"silver,red,brown,navy","tags":"warrior,sword,cape,armor,boy","w":768,"h":768},{"id":"char-002","file":"png/char-002.png","role":"mage","colors":"purple,blue,gold","tags":"mage,staff,wizard-hat,girl","w":768,"h":768},{"id":"char-003","file":"png/char-003.png","role":"healer","colors":"pink,green,white","tags":"healer,heart-staff,robe,girl","w":768,"h":768},{"id":"char-004","file":"png/char-004.png","role":"archer","colors":"green,auburn,brown","tags":"archer,bow,hood,girl","w":768,"h":768},{"id":"char-005","file":"png/char-005.png","role":"rogue","colors":"black,grey,silver","tags":"rogue,daggers,cloak,boy","w":768,"h":768},{"id":"char-006","file":"png/char-006.png","role":"tank","colors":"blue,silver,blonde","tags":"tank,shield,armor,boy","w":768,"h":768},{"id":"char-007","file":"png/char-007.png","role":"support","colors":"teal,orange,gold","tags":"bard,lute,support,boy","w":768,"h":768},{"id":"char-008","file":"png/char-008.png","role":"monster-ally","colors":"orange,white","tags":"slime-fox,ally,cute","w":768,"h":768},{"id":"char-009","file":"png/char-009.png","role":"monster-ally","colors":"green,cream","tags":"leaf-sprite,nature,ally","w":768,"h":768},{"id":"char-010","file":"png/char-010.png","role":"boss","colors":"purple,pink,violet","tags":"crystal-golem,boss,tank","w":768,"h":768},{"id":"char-011","file":"png/char-011.png","role":"boss","colors":"blue-grey,electric-blue","tags":"storm-wolf,boss,ally","w":768,"h":768},{"id":"char-012","file":"png/char-012.png","role":"rogue","colors":"navy,magenta,black","tags":"ninja,girl,dual-blade","w":768,"h":768},{"id":"char-013","file":"png/char-013.png","role":"warrior","colors":"pink,silver,black","tags":"heart-knight,girl,sword,shield","w":768,"h":768},{"id":"char-014","file":"png/char-014.png","role":"mage","colors":"orange,yellow,gold","tags":"sun-mage,boy,staff","w":768,"h":768},{"id":"char-015","file":"png/char-015.png","role":"healer","colors":"mint,yellow,brown","tags":"nature-healer,boy,leaf-pouch","w":768,"h":768},{"id":"char-016","file":"png/char-016.png","role":"archer","colors":"cyan,blue,brown","tags":"archer,boy,bow","w":768,"h":768},{"id":"char-017","file":"png/char-017.png","role":"rogue","colors":"lavender,silver,purple","tags":"rogue,girl,daggers,braids","w":768,"h":768},{"id":"char-018","file":"png/char-018.png","role":"tank","colors":"teal,gold,red","tags":"tank,girl,mace,kite-shield","w":768,"h":768},{"id":"char-019","file":"png/char-019.png","role":"support","colors":"peach,coral,cream","tags":"idol-support,girl,music-orb","w":768,"h":768},{"id":"char-020","file":"png/char-020.png","role":"monster-ally","colors":"white,blue-grey,gold","tags":"cloud-sheep,ally,cute","w":768,"h":768},{"id":"char-021","file":"png/char-021.png","role":"monster-ally","colors":"emerald,brown,black","tags":"beetle-scout,ally,map","w":768,"h":768},{"id":"char-022","file":"png/char-022.png","role":"boss","colors":"coral,gold,amber","tags":"crystal-phoenix,boss","w":768,"h":768},{"id":"char-023","file":"png/char-023.png","role":"boss","colors":"orange,charcoal","tags":"lava-pudding,boss,volcano","w":768,"h":768},{"id":"char-024","file":"png/char-024.png","role":"warrior","colors":"forest-green,brown","tags":"forest-warrior,boy,dual-axes","w":768,"h":768},{"id":"char-025","file":"png/char-025.png","role":"mage","colors":"mint,indigo,gold","tags":"moon-mage,girl,twin-tails","w":768,"h":768},{"id":"char-026","file":"png/char-026.png","role":"healer","colors":"sky-blue,white,gold","tags":"nurse-healer,girl,thermometer-staff","w":768,"h":768},{"id":"char-027","file":"png/char-027.png","role":"archer","colors":"purple,magenta,black","tags":"crossbow-ranger,girl","w":768,"h":768},{"id":"char-028","file":"png/char-028.png","role":"rogue","colors":"auburn,olive,grey","tags":"slingshot-rogue,boy","w":768,"h":768},{"id":"char-029","file":"png/char-029.png","role":"tank","colors":"bronze,cream,brown","tags":"cookie-tank,boy,hammer","w":768,"h":768},{"id":"char-030","file":"png/char-030.png","role":"support","colors":"yellow,cyan,navy","tags":"rain-mage,boy,umbrella","w":768,"h":768},{"id":"char-031","file":"png/char-031.png","role":"monster-ally","colors":"lavender,gold,pink","tags":"star-bunny,ally","w":768,"h":768},{"id":"char-032","file":"png/char-032.png","role":"monster-ally","colors":"cream,cobalt-blue","tags":"teacup-dragon,ally","w":768,"h":768},{"id":"char-033","file":"png/char-033.png","role":"boss","colors":"navy,ice-blue,white","tags":"ice-penguin-king,boss","w":768,"h":768},{"id":"char-034","file":"png/char-034.png","role":"boss","colors":"brass,ivory,emerald","tags":"clockwork-beetle,boss","w":768,"h":768},{"id":"char-035","file":"png/char-035.png","role":"warrior","colors":"crimson,cream,gold","tags":"spear-warrior,girl","w":768,"h":768},{"id":"char-036","file":"png/char-036.png","role":"mage","colors":"white,indigo,silver","tags":"book-mage,boy,horns","w":768,"h":768},{"id":"char-037","file":"png/char-037.png","role":"archer","colors":"blond,denim-blue,orange","tags":"fox-scarf-archer,boy","w":768,"h":768},{"id":"char-038","file":"png/char-038.png","role":"rogue","colors":"teal,grey,lime","tags":"cap-rogue,girl,smoke-bomb","w":768,"h":768},{"id":"char-039","file":"png/char-039.png","role":"healer","colors":"pink,white,gold","tags":"potion-alchemist,boy","w":768,"h":768},{"id":"char-040","file":"png/char-040.png","role":"tank","colors":"rose-gold,black","tags":"rose-knight,girl,tower-shield","w":768,"h":768},{"id":"char-041","file":"png/char-041.png","role":"support","colors":"honey,pastel-rainbow,purple","tags":"drum-bard,girl","w":768,"h":768},{"id":"char-042","file":"png/char-042.png","role":"monster-ally","colors":"mint,cream,pink","tags":"cactus-cat,ally","w":768,"h":768},{"id":"char-043","file":"png/char-043.png","role":"monster-ally","colors":"peach,white","tags":"origami-crane,ally","w":768,"h":768},{"id":"char-044","file":"png/char-044.png","role":"boss","colors":"grey,yellow,purple","tags":"storm-octopus,boss","w":768,"h":768},{"id":"char-045","file":"png/char-045.png","role":"boss","colors":"grape-purple,gold","tags":"candy-slime-king,boss","w":768,"h":768},{"id":"char-046","file":"png/char-046.png","role":"warrior","colors":"amber,navy,black","tags":"practice-samurai,boy","w":768,"h":768},{"id":"char-047","file":"png/char-047.png","role":"mage","colors":"silver-blue,teal,navy","tags":"ice-crystal-mage,girl","w":768,"h":768},{"id":"char-048","file":"png/char-048.png","role":"healer","colors":"chestnut,sage,cream","tags":"herbalist,girl,glasses","w":768,"h":768},{"id":"char-049","file":"png/char-049.png","role":"monster-ally","colors":"navy,yellow","tags":"lantern-fish,ally","w":768,"h":768},{"id":"char-050","file":"png/char-050.png","role":"support","colors":"lavender,cream,violet","tags":"librarian-support,bookmark-wand","w":768,"h":768},{"id":"char-051","file":"png/char-051.png","role":"warrior","colors":"crimson,silver,brown,navy","tags":"warrior,sword,armor,cape,boy,rpg-job","w":768,"h":768},{"id":"char-052","file":"png/char-052.png","role":"mage","colors":"purple,indigo,silver,gold","tags":"mage,staff,wizard-hat,girl,rpg-job","w":768,"h":768},{"id":"char-053","file":"png/char-053.png","role":"healer","colors":"pink,cream,silver,sage","tags":"healer,staff,robe,girl,rpg-job","w":768,"h":768},{"id":"char-054","file":"png/char-054.png","role":"archer","colors":"sage,pink,brown,forest","tags":"archer,bow,hood,girl,rpg-job","w":768,"h":768},{"id":"char-055","file":"png/char-055.png","role":"rogue","colors":"navy,maroon,purple,pink","tags":"rogue,daggers,cloak,boy,rpg-job","w":768,"h":768},{"id":"char-056","file":"png/char-056.png","role":"tank","colors":"silver,blue,pink,amber","tags":"tank,shield,heavy-armor,boy,rpg-job","w":768,"h":768},{"id":"char-057","file":"png/char-057.png","role":"bard","colors":"orange,pink,teal,gold","tags":"bard,lute,cape,music,rpg-job","w":768,"h":768},{"id":"char-058","file":"png/char-058.png","role":"paladin","colors":"cream,pink,sage,gold","tags":"paladin,holy-sword,armor,boy,rpg-job","w":768,"h":768},{"id":"char-059","file":"png/char-059.png","role":"ninja","colors":"navy,indigo,black,teal","tags":"ninja,mask,kunai,stealth,rpg-job","w":768,"h":768},{"id":"char-060","file":"png/char-060.png","role":"cook","colors":"brown,pink,amber,cream","tags":"cook,chef-hat,pan,apron,rpg-job","w":768,"h":768},{"id":"char-061","file":"png/char-061.png","role":"scholar","colors":"brown,pink,sage,cream","tags":"scholar,book,glasses,robe,rpg-job","w":768,"h":768},{"id":"char-062","file":"png/char-062.png","role":"beast-tamer","colors":"brown,pink,amber,orange","tags":"beast-tamer,whip,creature,ally,rpg-job","w":768,"h":768}];
var byId = {};
CHARS.forEach(function(c){ byId[c.id] = c; });

function padId(id){
  if (typeof id === 'number') return 'char-' + String(id).padStart(3,'0');
  id = String(id);
  if (/^\d+$/.test(id)) return 'char-' + id.padStart(3,'0');
  return id;
}

function url(id, baseHref){
  id = padId(id);
  var meta = byId[id];
  var file = meta ? meta.file : ('png/' + id + '.png');
  var base = baseHref || '';
  if (base && base.slice(-1) !== '/') base += '/';
  return base + file;
}

function imgEl(id, opts){
  opts = opts || {};
  var img = document.createElement('img');
  img.src = url(id, opts.base || opts.baseHref);
  img.alt = opts.alt || padId(id);
  img.decoding = 'async';
  img.loading = opts.loading || 'lazy';
  if (opts.width) img.width = opts.width;
  if (opts.height) img.height = opts.height;
  if (opts.className) img.className = opts.className;
  img.style.imageRendering = 'auto';
  return img;
}

function pickerHTML(opts){
  opts = opts || {};
  var base = opts.base || opts.baseHref || '';
  var filter = opts.filter; // role string or fn
  var list = CHARS.filter(function(c){
    if (!filter) return true;
    if (typeof filter === 'function') return filter(c);
    return c.role === filter || (c.tags && c.tags.indexOf(filter) >= 0);
  });
  var size = opts.size || 64;
  var html = '<div class="hcy-char-picker" style="display:flex;flex-wrap:wrap;gap:8px;max-height:240px;overflow:auto;padding:6px">';
  list.forEach(function(c){
    html += '<button type="button" class="hcy-char-pick" data-char="'+c.id+'" title="'+c.id+' · '+c.role+'" ' +
      'style="border:2px solid #333;border-radius:12px;padding:4px;background:#fff;cursor:pointer">' +
      '<img src="'+url(c.id, base)+'" width="'+size+'" height="'+size+'" alt="'+c.id+'" loading="lazy"/>' +
      '</button>';
  });
  html += '</div>';
  return html;
}

function mountPicker(parent, opts){
  opts = opts || {};
  var wrap = document.createElement('div');
  wrap.innerHTML = pickerHTML(opts);
  parent.appendChild(wrap);
  wrap.addEventListener('click', function(e){
    var btn = e.target.closest && e.target.closest('[data-char]');
    if (!btn) return;
    var id = btn.getAttribute('data-char');
    if (typeof opts.onPick === 'function') opts.onPick(id, byId[id]);
  });
  return wrap;
}

global.HCY_CHARS = {
  list: CHARS,
  byId: byId,
  url: url,
  imgEl: imgEl,
  pickerHTML: pickerHTML,
  mountPicker: mountPicker,
  padId: padId,
  COUNT: CHARS.length
};
})(typeof window !== 'undefined' ? window : globalThis);
