/*! Alias — Argon name p6-pronouns-100.js → same as pronoun-bank.js */
/*! Shared pronoun bank (from G15) — load before game logic; G15/G16 may keep inline fallback */
(function(g){
var CAT_TIPS = {
  1: "Subject personal: I, you, he, she, it, we, they (do the action).",
  2: "Object personal: me, you, him, her, it, us, them (receive the action).",
  3: "Possessive adjectives: my, your, his, her, its, our, their (+ noun).",
  4: "Possessive pronouns: mine, yours, his, hers, ours, theirs (stand alone).",
  5: "Reflexive: myself, yourself, himself, herself, itself, ourselves, yourselves, themselves.",
  6: "Mixed: check if you need subject, object, possessive or reflexive."
};
var BANK = [
  // ===== CAT 1 Subject personal (16) =====
  {id:1, category:1, stem:'<span class="hint">Tom</span> is hungry. ___ wants a sandwich.', choices:["He","Him","His","Himself"], answerIndex:0, tip:CAT_TIPS[1]},
  {id:2, category:1, stem:'<span class="hint">Mary and I</span> are classmates. ___ sit together.', choices:["We","Us","Our","Ourselves"], answerIndex:0, tip:CAT_TIPS[1]},
  {id:3, category:1, stem:'Look! <span class="hint">The cat</span> is sleeping. ___ looks so cute.', choices:["It","Its","Itself","Them"], answerIndex:0, tip:CAT_TIPS[1]},
  {id:4, category:1, stem:'<span class="hint">My sister</span> loves drawing. ___ draws every day.', choices:["She","Her","Hers","Herself"], answerIndex:0, tip:CAT_TIPS[1]},
  {id:5, category:1, stem:'<span class="hint">The boys</span> are playing football. ___ are noisy!', choices:["They","Them","Their","Themselves"], answerIndex:0, tip:CAT_TIPS[1]},
  {id:6, category:1, stem:'Hello! ___ am <span class="hint">Peter</span>. Nice to meet you.', choices:["I","Me","My","Myself"], answerIndex:0, tip:CAT_TIPS[1]},
  {id:7, category:1, stem:'<span class="hint">You and your brother</span> can help. ___ can carry the boxes.', choices:["You","Your","Yours","Yourself"], answerIndex:0, tip:CAT_TIPS[1]},
  {id:8, category:1, stem:'<span class="hint">Dad</span> is cooking dinner. ___ is in the kitchen.', choices:["He","Him","His","Himself"], answerIndex:0, tip:CAT_TIPS[1]},
  {id:9, category:1, stem:'<span class="hint">Grandma</span> tells great stories. ___ makes us laugh.', choices:["She","Her","Hers","Herself"], answerIndex:0, tip:CAT_TIPS[1]},
  {id:10, category:1, stem:'<span class="hint">The students</span> finished early. ___ went to the playground.', choices:["They","Them","Their","Themselves"], answerIndex:0, tip:CAT_TIPS[1]},
  {id:11, category:1, stem:'<span class="hint">My friend and I</span> walk to school. ___ leave at 7:30.', choices:["We","Us","Our","Ourselves"], answerIndex:0, tip:CAT_TIPS[1]},
  {id:12, category:1, stem:'Is <span class="hint">the bus</span> late? ___ usually comes at eight.', choices:["It","Its","Itself","They"], answerIndex:0, tip:CAT_TIPS[1]},
  {id:13, category:1, stem:'<span class="hint">Mr Chan</span> teaches English. ___ is very kind.', choices:["He","Him","His","Himself"], answerIndex:0, tip:CAT_TIPS[1]},
  {id:14, category:1, stem:'<span class="hint">Amy</span> forgot her book. ___ left it at home.', choices:["She","Her","Hers","Herself"], answerIndex:0, tip:CAT_TIPS[1]},
  {id:15, category:1, stem:'Can ___ help <span class="hint">me</span>, please? I need a ruler.', choices:["you","your","yours","yourself"], answerIndex:0, tip:CAT_TIPS[1]},
  {id:16, category:1, stem:'<span class="hint">The birds</span> are singing. ___ sound lovely.', choices:["They","Them","Their","Themselves"], answerIndex:0, tip:CAT_TIPS[1]},

  // ===== CAT 2 Object personal (16) =====
  {id:17, category:2, stem:'Please give <span class="hint">the book</span> to ___. I need it.', choices:["me","I","my","myself"], answerIndex:0, tip:CAT_TIPS[2]},
  {id:18, category:2, stem:'Mum is calling <span class="hint">Tom</span>. Can you tell ___?', choices:["him","he","his","himself"], answerIndex:0, tip:CAT_TIPS[2]},
  {id:19, category:2, stem:'I saw <span class="hint">Lucy</span> at the park. I waved to ___.', choices:["her","she","hers","herself"], answerIndex:0, tip:CAT_TIPS[2]},
  {id:20, category:2, stem:'The teacher asked <span class="hint">the class</span> a question. She looked at ___.', choices:["them","they","their","themselves"], answerIndex:0, tip:CAT_TIPS[2]},
  {id:21, category:2, stem:'Can you help <span class="hint">my brother and me</span>? Please help ___.', choices:["us","we","our","ourselves"], answerIndex:0, tip:CAT_TIPS[2]},
  {id:22, category:2, stem:'Put <span class="hint">the cup</span> on the table. Be careful with ___.', choices:["it","its","itself","them"], answerIndex:0, tip:CAT_TIPS[2]},
  {id:23, category:2, stem:'This gift is for <span class="hint">you</span>. I made it for ___.', choices:["you","your","yours","yourself"], answerIndex:0, tip:CAT_TIPS[2]},
  {id:24, category:2, stem:'Dad took <span class="hint">Sam</span> to the clinic. He waited with ___.', choices:["him","he","his","himself"], answerIndex:0, tip:CAT_TIPS[2]},
  {id:25, category:2, stem:'We invited <span class="hint">Aunt May</span> to dinner. We cooked for ___.', choices:["her","she","hers","herself"], answerIndex:0, tip:CAT_TIPS[2]},
  {id:26, category:2, stem:'Please pass ___ the salt. <span class="hint">I</span> cannot reach it.', choices:["me","I","my","myself"], answerIndex:0, tip:CAT_TIPS[2]},
  {id:27, category:2, stem:'The dog followed <span class="hint">the children</span>. It barked at ___.', choices:["them","they","their","themselves"], answerIndex:0, tip:CAT_TIPS[2]},
  {id:28, category:2, stem:'Grandpa told <span class="hint">Ben and me</span> a joke. He made ___ laugh.', choices:["us","we","our","ourselves"], answerIndex:0, tip:CAT_TIPS[2]},
  {id:29, category:2, stem:'I found <span class="hint">your pencil</span>. Do you want ___ back?', choices:["it","its","itself","them"], answerIndex:0, tip:CAT_TIPS[2]},
  {id:30, category:2, stem:'Miss Wong praised <span class="hint">Kelly</span>. She gave ___ a sticker.', choices:["her","she","hers","herself"], answerIndex:0, tip:CAT_TIPS[2]},
  {id:31, category:2, stem:'Can you show ___ <span class="hint">your homework</span>? I want to check.', choices:["me","I","my","myself"], answerIndex:0, tip:CAT_TIPS[2]},
  {id:32, category:2, stem:'The shopkeeper smiled at <span class="hint">the customers</span>. He thanked ___.', choices:["them","they","their","themselves"], answerIndex:0, tip:CAT_TIPS[2]},

  // ===== CAT 3 Possessive adjectives (17) =====
  {id:33, category:3, stem:'This is <span class="hint">my</span> bag. That is ___ bag too? (your)', choices:["your","yours","you","yourself"], answerIndex:0, tip:CAT_TIPS[3]},
  {id:34, category:3, stem:'<span class="hint">Tom</span> forgot ___ lunchbox at home.', choices:["his","him","he","himself"], answerIndex:0, tip:CAT_TIPS[3]},
  {id:35, category:3, stem:'<span class="hint">Amy</span> loves ___ new bicycle.', choices:["her","hers","she","herself"], answerIndex:0, tip:CAT_TIPS[3]},
  {id:36, category:3, stem:'The dog wagged ___ tail happily.', choices:["its","it","itself","their"], answerIndex:0, tip:CAT_TIPS[3]},
  {id:37, category:3, stem:'We cleaned ___ classroom after school.', choices:["our","ours","us","ourselves"], answerIndex:0, tip:CAT_TIPS[3]},
  {id:38, category:3, stem:'The girls put on ___ school shoes.', choices:["their","theirs","them","themselves"], answerIndex:0, tip:CAT_TIPS[3]},
  {id:39, category:3, stem:'Is this ___ pencil, Ken? (belonging to Ken)', choices:["your","yours","you","yourself"], answerIndex:0, tip:CAT_TIPS[3]},
  {id:40, category:3, stem:'<span class="hint">I</span> washed ___ hands before eating.', choices:["my","mine","me","myself"], answerIndex:0, tip:CAT_TIPS[3]},
  {id:41, category:3, stem:'<span class="hint">Mr Lee</span> parked ___ car outside.', choices:["his","him","he","himself"], answerIndex:0, tip:CAT_TIPS[3]},
  {id:42, category:3, stem:'<span class="hint">Mum</span> lost ___ keys again!', choices:["her","hers","she","herself"], answerIndex:0, tip:CAT_TIPS[3]},
  {id:43, category:3, stem:'The bird built ___ nest in the tree.', choices:["its","it","itself","their"], answerIndex:0, tip:CAT_TIPS[3]},
  {id:44, category:3, stem:'My cousins brought ___ favourite toys.', choices:["their","theirs","them","themselves"], answerIndex:0, tip:CAT_TIPS[3]},
  {id:45, category:3, stem:'Please write ___ name on the paper. (the listener\'s)', choices:["your","yours","you","yourself"], answerIndex:0, tip:CAT_TIPS[3]},
  {id:46, category:3, stem:'Dad and I packed ___ suitcases for the trip.', choices:["our","ours","us","ourselves"], answerIndex:0, tip:CAT_TIPS[3]},
  {id:47, category:3, stem:'<span class="hint">The baby</span> dropped ___ bottle on the floor.', choices:["its","it","itself","his"], answerIndex:0, tip:CAT_TIPS[3]},
  {id:48, category:3, stem:'Look at <span class="hint">the boys</span> — ___ football is under the bench.', choices:["their","theirs","them","they"], answerIndex:0, tip:CAT_TIPS[3]},
  {id:49, category:3, stem:'<span class="hint">We</span> (the class) like ___ new teacher. She is funny.', choices:["our","ours","us","ourselves"], answerIndex:0, tip:CAT_TIPS[3]},

  // ===== CAT 4 Possessive pronouns (16) =====
  {id:50, category:4, stem:'This book is <span class="hint">mine</span>. That one is ___. (your book)', choices:["yours","your","you","yourself"], answerIndex:0, tip:CAT_TIPS[4]},
  {id:51, category:4, stem:'Is this umbrella <span class="hint">Tom\'s</span>? Yes, it is ___.', choices:["his","him","he","himself"], answerIndex:0, tip:CAT_TIPS[4]},
  {id:52, category:4, stem:'Whose bag is this? It is <span class="hint">Mary\'s</span>. It is ___.', choices:["hers","her","she","herself"], answerIndex:0, tip:CAT_TIPS[4]},
  {id:53, category:4, stem:'These seats are <span class="hint">our</span> seats. They are ___.', choices:["ours","our","us","ourselves"], answerIndex:0, tip:CAT_TIPS[4]},
  {id:54, category:4, stem:'That football is <span class="hint">the boys\'</span>. It is ___.', choices:["theirs","their","them","themselves"], answerIndex:0, tip:CAT_TIPS[4]},
  {id:55, category:4, stem:'<span class="hint">My</span> lunchbox is blue. ___ is red. (your lunchbox)', choices:["Yours","Your","You","Yourself"], answerIndex:0, tip:CAT_TIPS[4]},
  {id:56, category:4, stem:'Don\'t take that pencil — it is ___. (<span class="hint">belongs to me</span>)', choices:["mine","my","me","myself"], answerIndex:0, tip:CAT_TIPS[4]},
  {id:57, category:4, stem:'<span class="hint">Dad</span> said the wallet is ___.', choices:["his","him","he","himself"], answerIndex:0, tip:CAT_TIPS[4]},
  {id:58, category:4, stem:'Is this scarf <span class="hint">Mum\'s</span>? Yes, it\'s ___.', choices:["hers","her","she","herself"], answerIndex:0, tip:CAT_TIPS[4]},
  {id:59, category:4, stem:'We found a phone. Is it ___? (<span class="hint">belonging to you</span>)', choices:["yours","your","you","yourself"], answerIndex:0, tip:CAT_TIPS[4]},
  {id:60, category:4, stem:'<span class="hint">Their</span> house is big. ___ is smaller. (our house)', choices:["Ours","Our","Us","Ourselves"], answerIndex:0, tip:CAT_TIPS[4]},
  {id:61, category:4, stem:'The red shoes are <span class="hint">the girls\'</span>. They are ___.', choices:["theirs","their","them","themselves"], answerIndex:0, tip:CAT_TIPS[4]},
  {id:62, category:4, stem:'This water bottle is not ___. (<span class="hint">not belonging to me</span>)', choices:["mine","my","me","myself"], answerIndex:0, tip:CAT_TIPS[4]},
  {id:63, category:4, stem:'Which jacket is <span class="hint">Ken\'s</span>? The black one is ___.', choices:["his","him","he","himself"], answerIndex:0, tip:CAT_TIPS[4]},
  {id:64, category:4, stem:'Whose eraser is pink? It is <span class="hint">Lisa\'s</span> — it\'s ___.', choices:["hers","her","she","herself"], answerIndex:0, tip:CAT_TIPS[4]},
  {id:65, category:4, stem:'Is this classroom ___? (<span class="hint">belonging to us</span>)', choices:["ours","our","us","ourselves"], answerIndex:0, tip:CAT_TIPS[4]},

  // ===== CAT 5 Reflexive (17) =====
  {id:66, category:5, stem:'<span class="hint">I</span> hurt ___ when I fell off the bike.', choices:["myself","me","my","mine"], answerIndex:0, tip:CAT_TIPS[5]},
  {id:67, category:5, stem:'<span class="hint">Tom</span> taught ___ to play the piano.', choices:["himself","him","his","he"], answerIndex:0, tip:CAT_TIPS[5]},
  {id:68, category:5, stem:'<span class="hint">Sarah</span> looked at ___ in the mirror.', choices:["herself","her","hers","she"], answerIndex:0, tip:CAT_TIPS[5]},
  {id:69, category:5, stem:'Be careful! Don\'t cut ___ with that knife. (<span class="hint">you</span>)', choices:["yourself","you","your","yours"], answerIndex:0, tip:CAT_TIPS[5]},
  {id:70, category:5, stem:'<span class="hint">We</span> enjoyed ___ at the funfair.', choices:["ourselves","us","our","ours"], answerIndex:0, tip:CAT_TIPS[5]},
  {id:71, category:5, stem:'<span class="hint">The children</span> made the cake by ___.', choices:["themselves","them","their","theirs"], answerIndex:0, tip:CAT_TIPS[5]},
  {id:72, category:5, stem:'<span class="hint">The cat</span> washed ___ after eating.', choices:["itself","it","its","them"], answerIndex:0, tip:CAT_TIPS[5]},
  {id:73, category:5, stem:'Did <span class="hint">you two</span> introduce ___ to the new teacher?', choices:["yourselves","yourself","you","your"], answerIndex:0, tip:CAT_TIPS[5]},
  {id:74, category:5, stem:'<span class="hint">I</span> can carry the bag by ___. Don\'t worry!', choices:["myself","me","my","mine"], answerIndex:0, tip:CAT_TIPS[5]},
  {id:75, category:5, stem:'<span class="hint">Dad</span> fixed the chair by ___.', choices:["himself","him","his","he"], answerIndex:0, tip:CAT_TIPS[5]},
  {id:76, category:5, stem:'<span class="hint">Mum</span> bought ___ a new dress.', choices:["herself","her","hers","she"], answerIndex:0, tip:CAT_TIPS[5]},
  {id:77, category:5, stem:'Please help ___ to some fruit. (<span class="hint">you</span>, polite)', choices:["yourself","you","your","yours"], answerIndex:0, tip:CAT_TIPS[5]},
  {id:78, category:5, stem:'<span class="hint">My sister and I</span> painted the room ___.', choices:["ourselves","us","our","ours"], answerIndex:0, tip:CAT_TIPS[5]},
  {id:79, category:5, stem:'<span class="hint">The boys</span> blamed ___ for the broken window.', choices:["themselves","them","their","theirs"], answerIndex:0, tip:CAT_TIPS[5]},
  {id:80, category:5, stem:'<span class="hint">The robot</span> turned ___ off automatically.', choices:["itself","it","its","them"], answerIndex:0, tip:CAT_TIPS[5]},
  {id:81, category:5, stem:'<span class="hint">Kids</span>, please behave ___.', choices:["yourselves","yourself","you","your"], answerIndex:0, tip:CAT_TIPS[5]},
  {id:82, category:5, stem:'<span class="hint">She</span> cut ___ a slice of cake.', choices:["herself","her","hers","she"], answerIndex:0, tip:CAT_TIPS[5]},

  // ===== CAT 6 Mixed (18) =====
  {id:83, category:6, stem:'<span class="hint">Peter</span> is my friend. I play with ___ every day.', choices:["him","he","his","himself"], answerIndex:0, tip:CAT_TIPS[2]},
  {id:84, category:6, stem:'Is this <span class="hint">your</span> ruler? No, ___ is longer.', choices:["mine","my","me","myself"], answerIndex:0, tip:CAT_TIPS[4]},
  {id:85, category:6, stem:'<span class="hint">The girls</span> enjoyed ___ at the picnic.', choices:["themselves","them","their","theirs"], answerIndex:0, tip:CAT_TIPS[5]},
  {id:86, category:6, stem:'<span class="hint">My brother</span> lost ___ keys on the bus.', choices:["his","him","he","himself"], answerIndex:0, tip:CAT_TIPS[3]},
  {id:87, category:6, stem:'Can ___ open the door, please? <span class="hint">My hands</span> are full.', choices:["you","your","yours","yourself"], answerIndex:0, tip:CAT_TIPS[1]},
  {id:88, category:6, stem:'This water bottle is <span class="hint">Jenny\'s</span>. Please give it to ___.', choices:["her","she","hers","herself"], answerIndex:0, tip:CAT_TIPS[2]},
  {id:89, category:6, stem:'<span class="hint">We</span> cooked dinner by ___. Nobody helped us.', choices:["ourselves","us","our","ours"], answerIndex:0, tip:CAT_TIPS[5]},
  {id:90, category:6, stem:'Whose shoes are these? They are <span class="hint">the twins\'</span>. They are ___.', choices:["theirs","their","them","themselves"], answerIndex:0, tip:CAT_TIPS[4]},
  {id:91, category:6, stem:'<span class="hint">The puppy</span> chased ___ tail in circles.', choices:["its","it","itself","their"], answerIndex:0, tip:CAT_TIPS[3]},
  {id:92, category:6, stem:'Mum asked <span class="hint">Ben and me</span> to wash the dishes. She asked ___.', choices:["us","we","our","ourselves"], answerIndex:0, tip:CAT_TIPS[2]},
  {id:93, category:6, stem:'<span class="hint">I</span> bought ___ a new pencil case. (for me)', choices:["myself","me","my","mine"], answerIndex:0, tip:CAT_TIPS[5]},
  {id:94, category:6, stem:'<span class="hint">Miss Wong</span> is our teacher. ___ teaches Science too.', choices:["She","Her","Hers","Herself"], answerIndex:0, tip:CAT_TIPS[1]},
  {id:95, category:6, stem:'That lunchbox is not ___ — ___ is the green one. (belonging to you / belonging to me)', choices:["yours; mine","your; my","you; me","yourself; myself"], answerIndex:0, tip:CAT_TIPS[4]},
  {id:96, category:6, stem:'Please put <span class="hint">the books</span> on the shelf. Put ___ away neatly.', choices:["them","they","their","themselves"], answerIndex:0, tip:CAT_TIPS[2]},
  {id:97, category:6, stem:'<span class="hint">Uncle Bob</span> fixed the bike by ___.', choices:["himself","him","his","he"], answerIndex:0, tip:CAT_TIPS[5]},
  {id:98, category:6, stem:'We love ___ school. It is friendly and bright.', choices:["our","ours","us","ourselves"], answerIndex:0, tip:CAT_TIPS[3]},
  {id:99, category:6, stem:'Is this scarf ___? (belonging to <span class="hint">Mary</span>)', choices:["hers","her","she","herself"], answerIndex:0, tip:CAT_TIPS[4]},
  {id:100, category:6, stem:'Look at <span class="hint">Jack and Jill</span> — ___ are running to the gate!', choices:["they","them","their","themselves"], answerIndex:0, tip:CAT_TIPS[1]}
];
g.HCY_PRONOUN_BANK = BANK;
g.HCY_BANKS = g.HCY_BANKS || {};
g.HCY_BANKS.pronouns = BANK;
g.HCY_BANKS.pronounTips = CAT_TIPS;
g.HCY_BANKS['pronoun-bank'] = BANK;
if (typeof g.CAT_TIPS === 'undefined') g.CAT_TIPS = CAT_TIPS;
if (typeof g.BANK === 'undefined') g.BANK = BANK;
})(typeof window !== 'undefined' ? window : globalThis);
