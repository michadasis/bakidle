// Bakidle character database.
// Images are hotlinked from MyAnimeList's character CDN (cdn.myanimelist.net), the same way
// AniList/MAL serve character art for fan tools and other "-dle" style games. Characters
// without a verified MAL image fall back to a generated avatar in the UI.
// Height/weight/age/saga are approximate, fan-compiled figures for gameplay purposes.
// Quotes marked quoteVerified:true are sourced verbatim (WikiQuote); all others are
// paraphrased, characteristic lines, not verbatim script excerpts, and the UI labels them as such.

// grapplerOnly marks characters who never appear past the original Grappler Baki run, so the
// "modern era only" setting can drop them from the answer pool while keeping everyone who
// carries on into New Grappler Baki and later.
const SAGAS = [
  { id: "original", name: "Original Saga", order: 1 },
  { id: "underground", name: "Underground Arena Saga", order: 2 },
  { id: "deathrow", name: "Most Evil Death Row Convicts Saga", order: 3 },
  { id: "pickle", name: "Southeast Asia (Pickle) Saga", order: 4 },
  { id: "raitaisai", name: "Great Raitaisai Saga", order: 5 },
  { id: "musashi", name: "Musashi Saga", order: 6 },
  { id: "sonofogre", name: "Son of Ogre Saga", order: 7 },
];

function sagaByName(name) {
  return SAGAS.find((s) => s.name === name);
}

const CHARACTERS = [
  { name: "Baki Hanma", alias: "The Son of Ogre", gender: "Male", origin: "Japan", styles: ["Mixed Martial Arts"], saga: "Original Saga", height: 168, weight: 76, age: 18, status: "Alive",
    quote: "Come on, at least grunt!", quoteVerified: true, emoji: ["🧑", "🩹", "🥋", "👊"],
    voiceClips: ["clips/baki-hanma.mp3"],
    image: "https://cdn.myanimelist.net/images/characters/11/522460.jpg" },
  { name: "Yujiro Hanma", alias: "The Strongest Creature on Earth", gender: "Male", origin: "Japan", styles: ["Various Martial Arts"], saga: "Original Saga", height: 190, weight: 120, age: 37, status: "Alive",
    quote: "What's futile is not realizing the reality of your own futility. One hundred cowards are the same as one.", quoteVerified: true, emoji: ["👹", "👑", "💥", "😈"],
    voiceClips: ["clips/yujiro-hanma.mp3", "clips/yujiro-hanma-2.mp3"],
    image: "https://cdn.myanimelist.net/images/characters/15/602975.jpg" },
  { name: "Emi Akezawa", alias: "Baki's Mother", gender: "Female", origin: "Japan", styles: ["Non-Fighter"], saga: "Original Saga", height: 165, weight: 52, age: 30, status: "Deceased", grapplerOnly: true,
    quote: "Give your father something to be proud of!", quoteVerified: true, emoji: ["👩", "💰", "😏"],
    voiceClips: ["clips/emi-akezawa.mp3"],
    image: "https://cdn.myanimelist.net/images/characters/14/72769.jpg" },
  { name: "Doppo Orochi", alias: "The Ferocious Karate", gender: "Male", origin: "Japan", styles: ["Shinshinkai Karate", "Orochi-ryuu Karate"], saga: "Underground Arena Saga", height: 178, weight: 110, age: 56, status: "Alive",
    quote: "Karate was never about brute strength alone.", emoji: ["🥋", "🦍", "🇯🇵", "👊"],
    voiceClips: ["clips/doppo-orochi.mp3", "clips/doppo-orochi-2.mp3"],
    image: "https://cdn.myanimelist.net/images/characters/14/73969.jpg" },
  { name: "Kaoru Hanayama", alias: "The Iron Chief", gender: "Male", origin: "Japan", styles: ["Street Fighting"], saga: "Underground Arena Saga", height: 191, weight: 166, age: 20, status: "Alive",
    quote: "These bare hands are all the weapon I need.", emoji: ["💪", "⛓️", "😤"],
    voiceClips: ["clips/kaoru-hanayama.mp3"],
    image: "https://cdn.myanimelist.net/images/characters/12/72767.jpg" },
  { name: "Katsumi Orochi", alias: "Doppo's Son", gender: "Male", origin: "Japan", styles: ["Shinshinkai Karate"], saga: "Underground Arena Saga", height: 187, weight: 116, age: 21, status: "Alive",
    quote: "Someday, I'll surpass my father.", emoji: ["🥋", "🧑", "😓"],
    voiceClips: ["clips/katsumi-orochi.mp3"],
    image: "https://cdn.myanimelist.net/images/characters/11/363982.jpg" },
  { name: "Jack Hanma", alias: "Jack Hammer", gender: "Male", origin: "Canada", styles: ["Pit Fighting", "Goudou"], saga: "Underground Arena Saga", height: 193, weight: 116, age: 21, status: "Alive",
    quote: "Pain just makes me stronger.", emoji: ["🇺🇸", "💪", "🩹", "😤"],
    voiceClips: ["clips/jack-hanma.mp3"],
    image: "https://cdn.myanimelist.net/images/characters/14/393003.jpg" },
  { name: "Retsu Kaioh", alias: "The Undefeated of the East", gender: "Male", origin: "China", styles: ["Chinese Kenpo"], saga: "Underground Arena Saga", height: 176, weight: 106, age: 30, status: "Deceased",
    quote: "My stance has never once been broken.", emoji: ["🐉", "🇨🇳", "🥋", "🧘"],
    voiceClips: ["clips/retsu-kaioh.mp3"],
    image: "https://cdn.myanimelist.net/images/characters/4/522042.jpg" },
  { name: "Gouki Shibukawa", alias: "The Paralyzing Fossil", gender: "Male", origin: "Japan", styles: ["Shibukawa-ryuu Jujutsu", "Judo"], saga: "Underground Arena Saga", height: 155, weight: 47, age: 75, status: "Alive",
    quote: "An old fossil can still stop your heart with one touch.", emoji: ["👴", "✋", "😵", "🥋"],
    voiceClips: ["clips/gouki-shibukawa.mp3", "clips/gouki-shibukawa-2.mp3"],
    image: "https://cdn.myanimelist.net/images/characters/2/522038.jpg" },
  { name: "Kureha Shinogi", alias: "The Genius Doctor", gender: "Male", origin: "Japan", styles: ["Athlete Style"], saga: "Underground Arena Saga", height: 184, weight: 131, age: 30, status: "Alive",
    quote: "Let me patch you up before you break anything else.", emoji: ["👩‍⚕️", "💉", "🩺"],
    voiceClips: ["clips/kureha-shinogi.mp3"],
    image: "https://cdn.myanimelist.net/images/characters/5/73572.jpg" },
  { name: "Koushou Shinogi", alias: "The Cord Cutter", gender: "Male", origin: "Japan", styles: ["Himokiri Karate", "Shinogi-ryuu Karate"], saga: "Underground Arena Saga", height: 177, weight: 81, age: 25, status: "Alive",
    quote: "One precise strike is worth a thousand wild ones.", emoji: ["👴", "✋", "🩹"],
    voiceClips: ["clips/koushou-shinogi.mp3"],
    image: "https://cdn.myanimelist.net/images/characters/5/74696.jpg" },
  { name: "Atsushi Suedou", alias: "The Vale Tudo Karateka", gender: "Male", origin: "Japan", styles: ["Shinshinkai Karate"], saga: "Underground Arena Saga", height: 205, weight: 130, age: 25, status: "Alive", grapplerOnly: true,
    quote: "Karate that can't kill isn't real karate.", emoji: ["🥋", "😠", "👊"],
    voiceClips: ["clips/atsushi-suedou.mp3"],
    image: "https://cdn.myanimelist.net/images/characters/14/363988.jpg" },
  { name: "Biscuit Oliva", alias: "The Level-70 Demon", gender: "Male", origin: "Cuba", styles: ["Brute Force"], saga: "Most Evil Death Row Convicts Saga", height: 190, weight: 150, age: 45, status: "Alive",
    quote: "They call me a demon. I call it a compliment.", emoji: ["😈", "💪", "🇺🇸", "⛓️"],
    voiceClips: ["clips/biscuit-oliva.mp3"],
    image: "https://cdn.myanimelist.net/images/characters/13/150181.jpg" },
  { name: "Dorian", alias: "The Poet of Death", gender: "Male", origin: "United States", styles: ["Chinese Kenpo"], saga: "Most Evil Death Row Convicts Saga", height: 203, weight: 130, age: 65, status: "Alive",
    quote: "Death, done well, is its own kind of art.", emoji: ["🗡️", "📜", "😏", "⛓️"],
    voiceClips: ["clips/dorian.mp3"],
    image: "https://cdn.myanimelist.net/images/characters/5/371798.jpg" },
  { name: "Spec", alias: "The Unkillable", gender: "Male", origin: "United States", styles: ["Brute Force"], saga: "Most Evil Death Row Convicts Saga", height: 221, weight: 70, age: 97, status: "Alive",
    quote: "You cannot kill what already refuses to die.", emoji: ["🌴", "🔫", "😐", "⛓️"],
    voiceClips: ["clips/spec.mp3"],
    image: "https://cdn.myanimelist.net/images/characters/6/359234.jpg" },
  { name: "Jun Guevaru", alias: "The Guerrilla King", gender: "Male", origin: "South America", styles: ["Mukakure-ryuu Ninjutsu"], saga: "Most Evil Death Row Convicts Saga", height: 180, weight: 78, age: 25, status: "Alive",
    quote: "The jungle raised me. It made me a king.", emoji: ["🌴", "👑", "🔫", "⛓️"],
    voiceClips: ["clips/guevaru.mp3"],
    image: "https://cdn.myanimelist.net/images/characters/10/563593.jpg" },
  { name: "Mount Toba", alias: "The Sumo Titan", gender: "Male", origin: "Japan", styles: ["Pro Wrestling"], saga: "Underground Arena Saga", height: 209, weight: 150, age: 50, status: "Alive", grapplerOnly: true,
    quote: "Sumo was never just about size.", emoji: ["🍙", "🤼", "🇯🇵"],
    voiceClips: ["clips/mount-toba.mp3"],
    image: "https://cdn.myanimelist.net/images/characters/14/423044.jpg" },
  { name: "Ryukou Yanagi", alias: "The Willow Fist", gender: "Male", origin: "Japan", styles: ["Way of the Void"], saga: "Most Evil Death Row Convicts Saga", height: 160, weight: 60, age: 50, status: "Alive",
    quote: "Bend like the willow, then strike like steel.", emoji: ["🥋", "🌿", "🇯🇵"],
    voiceClips: ["clips/ryukou-yanagi.mp3"],
    image: "https://cdn.myanimelist.net/images/characters/5/359233.jpg" },
  { name: "Hitoshi Kuriyagawa", alias: "The Professional Wrestler", gender: "Male", origin: "Japan", styles: ["Self-defense"], saga: "Underground Arena Saga", height: 185, weight: 110, age: 38, status: "Alive", grapplerOnly: true,
    quote: "Professional wrestling is real. Let me prove it in this ring.", emoji: ["🤼", "💪", "🇯🇵"],
    voiceClips: ["clips/hitoshi-kuriyagawa.mp3"],
    image: "https://cdn.myanimelist.net/images/characters/7/72770.jpg" },
  { name: "Kurokawa", alias: "The Swordsman", gender: "Male", origin: "Japan", styles: ["Sambo"], saga: "Underground Arena Saga", height: 178, weight: 74, age: 40, status: "Alive", grapplerOnly: true,
    quote: "A blade doesn't hesitate. Neither do I.", emoji: ["⚔️", "🇯🇵", "😐"],
    voiceClips: ["clips/kurokawa.mp3"],
    image: "https://cdn.myanimelist.net/images/characters/7/545392.jpg" },
  { name: "Motobe", alias: "The Karate Instructor", gender: "Male", origin: "Japan", styles: ["Motobe-ryuu Jujutsu", "Kenjutsu"], saga: "Underground Arena Saga", height: 170, weight: 80, age: 51, status: "Alive",
    quote: "Let me show you what real karate looks like.", emoji: ["🥋", "🧑‍🏫", "🇯🇵"],
    voiceClips: ["clips/motobe.mp3"],
    image: "https://cdn.myanimelist.net/images/characters/11/379070.jpg" },
  { name: "Mitsunari Tokugawa", alias: "The Underground Arena Owner", gender: "Male", origin: "Japan", styles: ["Non-Fighter"], saga: "Underground Arena Saga", height: 147, weight: 50, age: 80, status: "Alive",
    quote: "My arena exists for one reason: to watch true strength collide.", emoji: ["🎩", "💰", "🏟️"],
    voiceClips: ["clips/mitsunari-tokugawa.mp3"],
    image: "https://cdn.myanimelist.net/images/characters/14/359209.jpg" },
  { name: "Pickle", alias: "The Prehistoric Warrior", gender: "Male", origin: "Unknown", styles: ["Brute Force"], saga: "Southeast Asia (Pickle) Saga", height: 200, weight: 130, age: 200000000, status: "Alive",
    quote: "(A primal roar older than language itself.)", emoji: ["🦖", "🪨", "😤"],
    voiceClips: ["clips/pickle.mp3"],
    image: "https://cdn.myanimelist.net/images/characters/6/521114.jpg" },
  { name: "Musashi Miyamoto", alias: "The Sword Saint", gender: "Male", origin: "Japan", styles: ["Niten Ichi-ryuu"], saga: "Musashi Saga", height: 180, weight: 68, age: 32, status: "Alive",
    quote: "Four centuries gone, and my blade still remembers.", emoji: ["⚔️", "🎎", "🇯🇵", "⏳"],
    voiceClips: ["clips/musashi-miyamoto.mp3"],
    image: "https://cdn.myanimelist.net/images/characters/4/278163.jpg" },
  { name: "Sikorsky", alias: "The Ex-Spetsnaz Sniper", gender: "Male", origin: "Russia", styles: ["Brute Force"], saga: "Most Evil Death Row Convicts Saga", height: 191, weight: 100, age: 27, status: "Alive",
    quote: "One shot. That's all precision ever needs.", emoji: ["🇷🇺", "🎯", "🥶"],
    voiceClips: ["clips/sikorsky.mp3", "clips/sikorsky-2.mp3"],
    image: "https://cdn.myanimelist.net/images/characters/2/363978.jpg" },
  { name: "Hector Doyle", alias: "The Boxing Great Ape", gender: "Male", origin: "United Kingdom", styles: ["Brute Force", "Hidden Weapons"], saga: "Most Evil Death Row Convicts Saga", height: 185, weight: 85, age: 25, status: "Alive",
    quote: "My fists are the only truth I trust.", emoji: ["🥊", "🇺🇸", "😤"],
    voiceClips: ["clips/hector-doyle.mp3", "clips/hector-doyle-2.mp3"],
    image: "https://cdn.myanimelist.net/images/characters/6/521328.jpg" },
  { name: "Nomi no Sukune II", alias: "Descendant of the Sumo God", gender: "Male", origin: "Japan", styles: ["Ancient Sumo"], saga: "Great Raitaisai Saga", height: 210, weight: 250, age: 25, status: "Alive",
    quote: "My bloodline has thrown men since before your history began.", emoji: ["🤼", "⛩️", "🇯🇵"],
    voiceClips: ["clips/nomi-no-sukune-ii.mp3"],
    image: "https://cdn.myanimelist.net/images/characters/7/480947.jpg" },
  { name: "Julius Reinhold", alias: "The German Kickboxer", gender: "Male", origin: "Germany", styles: ["Brute Force"], saga: "Great Raitaisai Saga", height: 185, weight: 85, age: 36, status: "Alive",
    quote: "German steel, delivered straight through the shin.", emoji: ["🇩🇪", "🦵", "😤"],
    voiceClips: ["clips/julius-reinhold.mp3"],
    image: "https://cdn.myanimelist.net/images/characters/16/421203.jpg" },
  { name: "Mohammad Alai Jr.", alias: "The Assassin's Son", gender: "Male", origin: "United States", styles: ["Boxing"], saga: "Great Raitaisai Saga", height: 188, weight: 72, age: 25, status: "Alive",
    quote: "There's a blade hidden inside every strike I throw.", emoji: ["🗡️", "😶", "🌍"],
    voiceClips: ["clips/mohammad-alai-jr.mp3"],
    image: "https://cdn.myanimelist.net/images/characters/2/521332.jpg" },
  { name: "Mohammad Alai", alias: "The Assassin's Father", gender: "Male", origin: "United States", styles: ["Boxing"], saga: "Great Raitaisai Saga", height: 176, weight: 70, age: 60, status: "Alive",
    quote: "My son inherited more than my name.", emoji: ["🗡️", "🧔", "🌍"],
    voiceClips: ["clips/mohammad-alai.mp3"],
    image: "https://cdn.myanimelist.net/images/characters/5/521334.jpg" },
  { name: "Strydum", alias: "The Iron Body", gender: "Male", origin: "United States", styles: ["Military Fighting Style"], saga: "Great Raitaisai Saga", height: 195, weight: 100, age: 50, status: "Alive",
    quote: "My body became a fortress long ago.", emoji: ["🗿", "💪", "😐"],
    voiceClips: ["clips/strydum.mp3"],
    image: "https://cdn.myanimelist.net/images/characters/4/452970.jpg" },
  { name: "Kozue Matsumoto", alias: "Baki's Childhood Friend", gender: "Female", origin: "Japan", styles: ["Non-Fighter"], saga: "Original Saga", height: 160, weight: 45, age: 17, status: "Alive", grapplerOnly: true,
    quote: "I just want him to come home in one piece.", emoji: ["👩", "💌", "😟"],
    voiceClips: ["clips/kozue-matsumoto.mp3", "clips/kozue-matsumoto-2.mp3"],
    image: "https://cdn.myanimelist.net/images/characters/6/73968.jpg" },
  { name: "Chiharu Shiba", alias: "Baki's Classmate", gender: "Male", origin: "Japan", styles: ["Brute Force"], saga: "Original Saga", height: 185, weight: 72, age: 20, status: "Alive", grapplerOnly: true,
    quote: "I just wish you'd stay out of trouble for once.", emoji: ["👩‍🎓", "💭", "😳"],
    voiceClips: ["clips/chiharu-shiba.mp3"],
    image: "https://cdn.myanimelist.net/images/characters/4/363986.jpg" },
  { name: "Kaku Kaioh", alias: "The Kenpo Sage", gender: "Male", origin: "China", styles: ["Chinese Kenpo"], saga: "Son of Ogre Saga", height: 155, weight: 40, age: 146, status: "Alive",
    quote: "Wisdom this old doesn't need to raise its voice.", emoji: ["🧓", "🥋", "🇨🇳"],
    voiceClips: ["clips/kaku-kaioh.mp3"],
    image: "https://cdn.myanimelist.net/images/characters/4/519817.jpg" },
  { name: "Gaia", alias: "The Survivalist", gender: "Male", origin: "Japan", styles: ["Military Fighting Style"], saga: "Original Saga", height: 170, weight: 60, age: 30, status: "Alive",
    quote: "Out here, the one who prepares is the one who walks away.", emoji: ["🪖", "🌿", "🔪", "🥷"],
    image: "https://static.wikia.nocookie.net/baki/images/a/af/Gaia_profile.png" },
  { name: "Kiyosumi Katou", alias: "Doppo's Student", gender: "Male", origin: "Japan", styles: ["Shinshinkai Karate"], saga: "Underground Arena Saga", height: 180, weight: 80, age: 25, status: "Alive",
    quote: "I know I am outmatched. I am getting in the ring anyway.", emoji: ["🥋", "🩹", "😤", "👊"],
    image: "https://static.wikia.nocookie.net/baki/images/3/3d/Katou_profile.png" },
  { name: "Kaiou Ryuu", alias: "The Hundred-Year Kaioh", gender: "Male", origin: "China", styles: ["Chinese Kenpo"], saga: "Great Raitaisai Saga", height: 200, weight: 100, age: 100, status: "Alive",
    quote: "A century of practice does not bend to a boy's enthusiasm.", emoji: ["🐉", "👴", "🇨🇳", "👊"],
    image: "https://static.wikia.nocookie.net/baki/images/f/f0/Ryu_profile.png" },
  { name: "Iron Michael", alias: "The Boxing Champion", gender: "Male", origin: "United States", styles: ["Boxing"], saga: "Underground Arena Saga", height: 182, weight: 100, age: 30, status: "Alive", grapplerOnly: true,
    quote: "Nobody in this building has ever been hit by a real champion.", emoji: ["🥊", "🏆", "🇺🇸", "💥"],
    image: "https://static.wikia.nocookie.net/baki/images/9/96/Michael_profile.png" },
  { name: "Rob Robinson", alias: "The Kickboxing Ace", gender: "Male", origin: "United States", styles: ["Kickboxing"], saga: "Underground Arena Saga", height: 192, weight: 101, age: 30, status: "Alive", grapplerOnly: true,
    quote: "Hands are for show. The legs end it.", emoji: ["🦵", "🥊", "🇺🇸", "⚡"],
    image: "https://static.wikia.nocookie.net/baki/images/7/75/Robinson_profile.png" },
  { name: "Bunnoshin Inagi", alias: "The Nihon Kempo Prodigy", gender: "Male", origin: "Japan", styles: ["Nihon Kempo"], saga: "Underground Arena Saga", height: 170, weight: 75, age: 25, status: "Alive", grapplerOnly: true,
    quote: "Points and rules built me. Let us see what they are worth here.", emoji: ["🥋", "🇯🇵", "👊", "🎓"],
    image: "https://static.wikia.nocookie.net/baki/images/3/34/Inagi_profile.png" },
  { name: "Kaiou Ri", alias: "The Yakukouken Kaioh", gender: "Male", origin: "China", styles: ["Chinese Kenpo"], saga: "Great Raitaisai Saga", status: "Alive",
    quote: "The title of Kaioh is not handed out for enthusiasm.", emoji: ["🌊", "👑", "🇨🇳", "👊"],
    image: "https://static.wikia.nocookie.net/baki/images/3/32/Kaioh_ri_profile.png" },
  { name: "Kaiou Mou", alias: "The Jujuuken Kaioh", gender: "Male", origin: "China", styles: ["Chinese Kenpo"], saga: "Great Raitaisai Saga", status: "Alive",
    quote: "Size is its own school of martial arts.", emoji: ["🌊", "🐻", "🇨🇳", "👊"],
    image: "https://static.wikia.nocookie.net/baki/images/6/60/Mou_profile_e_e.png" },
  { name: "Kaiou Son", alias: "The Sekkendou Kaioh", gender: "Male", origin: "China", styles: ["Chinese Kenpo"], saga: "Great Raitaisai Saga", status: "Alive",
    quote: "Every stance I hold was old before your country was named.", emoji: ["🌊", "🧘", "🇨🇳", "👊"],
    image: "https://static.wikia.nocookie.net/baki/images/8/8a/Kaioh_son_profile.png" },
  { name: "Kaiou Han", alias: "The Kenoudou Kaioh", gender: "Male", origin: "China", styles: ["Chinese Kenpo"], saga: "Great Raitaisai Saga", status: "Alive",
    quote: "A fist that has never doubted itself does not miss.", emoji: ["🌊", "👊", "🇨🇳", "🔥"],
    image: "https://static.wikia.nocookie.net/baki/images/d/da/Kaioh_han_profile.png" },
  { name: "Kaiou Jo", alias: "The Ryuuouken Kaioh", gender: "Male", origin: "China", styles: ["Chinese Kenpo"], saga: "Great Raitaisai Saga", status: "Alive",
    quote: "The dragon does not hurry, and it is never late.", emoji: ["🌊", "🐉", "🇨🇳", "👊"],
    image: "https://static.wikia.nocookie.net/baki/images/7/72/Kaioh_jo_profile.png" },
  { name: "Kaiou Chin", alias: "The Sangouken Kaioh", gender: "Male", origin: "China", styles: ["Chinese Kenpo"], saga: "Great Raitaisai Saga", status: "Alive",
    quote: "Three thousand repetitions, and then it becomes yours.", emoji: ["🌊", "🔢", "🇨🇳", "👊"],
    image: "https://static.wikia.nocookie.net/baki/images/5/53/Kaioh_chin_profile.png" },
  { name: "Kaiou You", alias: "The Kongouken Kaioh", gender: "Male", origin: "China", styles: ["Chinese Kenpo"], saga: "Great Raitaisai Saga", status: "Alive",
    quote: "Strike me anywhere. You will only hurt your hand.", emoji: ["🌊", "💎", "🇨🇳", "🛡"],
    image: "https://static.wikia.nocookie.net/baki/images/1/17/Kaioh_yoh_profile.png" },
  { name: "Shunsei Kaku", alias: "The Young Kenpo Master", gender: "Male", origin: "China", styles: ["Chinese Kenpo"], saga: "Great Raitaisai Saga", age: 26, status: "Alive",
    quote: "I carry the name. Now I have to be worth it.", emoji: ["🧑", "🇨🇳", "🥋", "👊"],
    image: "https://static.wikia.nocookie.net/baki/images/8/84/Shunsei_profile_e_e.png" },
  { name: "Ryuushou So", alias: "The Kenpo Elder", gender: "Male", origin: "China", styles: ["Chinese Kenpo"], saga: "Great Raitaisai Saga", status: "Alive",
    quote: "You are watching a style older than your whole tournament.", emoji: ["👴", "🇨🇳", "🍃", "👊"],
    image: "https://static.wikia.nocookie.net/baki/images/5/51/SAMWANMASTER2.png" },
  { name: "Youou Chou", alias: "The Raitai Contender", gender: "Male", origin: "China", styles: ["Chinese Kenpo"], saga: "Great Raitaisai Saga", status: "Alive",
    quote: "China did not send me here to lose politely.", emoji: ["🌊", "🇨🇳", "🥋", "💥"],
    image: "https://static.wikia.nocookie.net/baki/images/b/bf/Cho_profile.png" },
  { name: "Shobun Ron", alias: "The Iai Kenpo Master", gender: "Male", origin: "Taiwan", styles: ["Iai Kenpo"], saga: "Great Raitaisai Saga", height: 178, age: 45, status: "Alive",
    quote: "The draw and the strike are the same motion. You will not see it.", emoji: ["🗡", "🇹🇼", "⚡", "👊"],
    image: "https://static.wikia.nocookie.net/baki/images/a/a6/Ron_profile_e_e.png" },
];
