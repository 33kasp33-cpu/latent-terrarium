window.LT_PACK={
  lang:'en',
  saveKey:'latent_terrarium_en',
  swPath:'../sw.js',
  names:['Mio','Nagi','Akari','Kuro','Hotaru'],
  topics:[
    'cold tea',
    'the window seat',
    'that borrowed umbrella',
    "yesterday's thread",
    'the stopped clock',
    'extra sugar cubes',
    'that old bridge',
    'the cracked box',
    'the stone below',
    'the back stairs',
    'an empty glass',
    'the spare key'
  ],
  litNames:{auto:'Auto',dawn:'Dawn',day:'Day',dusk:'Dusk',night:'Night'},
  phaseNames:{dawn:'Dawn',day:'Daylight',dusk:'Dusk',night:'Night'},
  ui:{
    sndOn:'Sound: On',
    sndOff:'Sound: Off',
    litPrefix:'Light: ',
    seeBed:'Riverbed',
    hideBed:'Hide Bed',
    dropSuffix:c=>c?` · ${c} ${c===1?'mote':'motes'}`:'',
    tankStatus:(days,ph,c)=>`Day ${days} · ${ph}${c?` · ${c} ${c===1?'mote':'motes'}`:''}`,
    lvText:(lv,w)=>`Lv ${Math.round(lv*100)}% [${w}]`,
    badges:{bound:'✦',rut:'≈',cold:'❄'},
    cellTitle:(n1,n2,aff,bed,rut)=>`${n1} × ${n2}: Current ${Math.round(aff*100)} / Riverbed ${Math.round(bed*100)} / Groove ${Math.round(rut*100)}%`,
    grudgeTitle:'Lingering Memory',
    noGrudge:'No deep memories have settled yet.',
    grudgeFmt:(from,to,w,n,mutual)=>`${from} → ${to} "${w}" ×${n}${mutual?'':' (forgotten by the other)'}`,
    echoTitle:'Echoes on the Floor (Recent Ripples)',
    noEcho:'No echoes yet.',
    echoQuote:t=>`— "${t}"`,
    echoSep:'  /  ',
    meta:(days,total,grooves,bonds,pairCnt)=>`Day ${days} | Ripples ${total} | Grooves ${grooves} | Bonds ${bonds}/${pairCnt}`,
    confirmDrain:'Draining the tank erases the settled riverbed forever, leaving behind only a final memory relic. Drain and renew the water?',
    confirmImport:'Replace your current terrarium with the imported save file?',
    importErr:'Could not read this save file.',
    epitaphText:'The water has drained away. This terrarium’s memory ends here.',
    btnPick:'Collect Relic (.json)',
    btnCopy:'Copy AI Story Prompt',
    btnCopyOk:'Copied! (Paste into any AI)',
    btnCopyErr:'Please use Collect Relic instead',
    btnShare:'Copy Share Text',
    btnShareOk:'Copied for sharing!',
    btnShareErr:'Could not copy',
    btnFresh:'Pour Fresh Water',
    fallbackName:'someone',
    silence:'...'
  },
  V:[
   // 0: Mio
   {o:{w:["I think this is just the right distance for now.","{x}, about what you said earlier...","Mind if I stay beside you?"],
       c:["...Do you have nothing to say?","Care to tell me why you keep pulling back?","You really wear your mood on your sleeve."],
       m:["Just observing. Don't mind me.","Can you feel anything shifting down below?","It's quiet. I don't hate it."],
       e:["...You're still here? Not that I mind.","Haven't we had this exact conversation?","We both have too much time on our hands."]},
    r:{w:["Really? It feels a bit close to me.","...Thank you. Probably.","That's not bad."],
       c:["I'd rather not answer right now.","Figure the reason out yourself.","...It's nothing. Same as usual."],
       m:["Who knows. Either way is fine.","I'll keep a note of that.","If that's how it looks, maybe it is."],
       e:["...Do you actually mean that?","Honestly, who cares anymore.","Yes, yes, I hear you."]},
    c3:{w:["...Then let's stay like this a little longer.","Heh. Not very honest with yourself, are you."],
        c:["...Right. I won't force it out of you.","Suit yourself."],
        m:["...Well, there's no rush anyway.","We can check again later."],
        e:["...Habit really is hard to break with you.","Unbelievable. Though I'm no better."]},
    tp:["{T}... I still haven't sorted it out.","I was thinking about {t} again.","Are you planning to just leave {t} like that?"],
    dr:["...Something drifted down from above.","Wait—was that there a moment ago?"],
    ret:["...It feels like a long stretch of time just slipped by.","Where did we leave off before the silence?"],
    lo:["...Let me rest a bit.","That's enough observing for today."],
    mm:["{x}, about {t}—that isn't settled yet.","I still remember {t}, just so you know."],
    mr1:["...You're bringing that up again?","I remember. Hard to forget something like that."],
    mr0:["{T}? ...Wait, what was that about?","Sorry, I don't seem to have it in my notes."],
    mf:["...Ah. So I'm the only one who remembers.","Fine. I'll hold onto the record myself."],
    g:"Not to pry, but {y} seems pretty far off today.",
    tic:"... (watching silently)"},

   // 1: Nagi
   {o:{w:["I just felt like drifting near here, okay?","Oh. Didn't notice you there.","...Current feels decent today."],
       c:["...Hey. Isn't it cold over there?","Why the hell aren't you talking?","Quit staring. Makes it awkward."],
       m:["So bored.","Hey, does any of this even mean anything?","Feels like I'm forgetting something important."],
       e:["...Ugh, I'm sleepy. What were we saying?","You again? Never get tired of hovering?","You're just always there like background air."]},
    r:{w:["Shut up.","...Well, could be worse.","Hey, I didn't say I hated it."],
       c:["Whatever.","Don't talk to me.","What's it to you?"],
       m:["Dunno.","Do whatever you want.","Beats me. You overthink everything."],
       e:["Look who's talking.","Wasn't listening, my bad.","...Huh? Say something?"]},
    c3:{w:["...What, don't laugh at me.","Alright, fine, I'll stick around a bit."],
        c:["...Tch. Zero charm.","Yeah, yeah, go do your own thing."],
        m:["...Welp, bored again.","Doesn't really matter, I guess."],
        e:["...Go somewhere else already. Not that you will.","Honestly, I can't even keep my guard up around you."]},
    tp:["{T}? Thought we were done with that.","Not {t} again.","Seriously, who's supposed to deal with {t}?"],
    dr:["...What is this, someone drop something?","Huh. Look, it's sinking slowly."],
    ret:["...Finally, the air moved a little.","That quiet streak lasted forever."],
    lo:["...Tired.","Not talking anymore today."],
    mm:["Hey {x}, I haven't let {t} slide, alright?","Oi, whatever happened with {t} anyway?"],
    mr1:["Persistent, aren't you?","...Wasn't just me, you screwed up too."],
    mr0:["Huh? {t}? No clue.","Did that even happen?"],
    mf:["...Wait, you seriously forgot?","Tch. Figures I'm the only one holding onto it."],
    g:"{y}'s acting kinda weird, isn't it?",
    tic:"...Tch."},

   // 2: Akari
   {o:{w:["Hey, it's so peaceful today!","{x}, come over here~","Somehow it feels calm right next to you."],
       c:["We aren't fighting, right? Right?","You're so far away, it's lonely...","Are you mad at me? Or am I imagining it?"],
       m:["Everything's so floaty today~","Want some tea? Not that we have any.","Wonder what time it is up there..."],
       e:["Mmm... even boiling water sounds like too much work.","Everything kinda blurs together around you.","Here we are, circling the same spot again."]},
    r:{w:["Hehe, yeah!","Mm-hmm, same here.","That makes me happy."],
       c:["Oh... I see.","Hmm, that's tricky...","Don't make such a serious face~"],
       m:["Right?","Wonder why though~","Eh, we'll figure it out eventually."],
       e:["Hahaha, that's mean~","Plain water's fine by me now.","Yeah, maybe that's just how we are."]},
    c3:{w:["Hehe, now I'm getting sleepy...","Can we just zone out like this?"],
        c:["...I'll talk to you again later, okay?","Aww, now I'm bummed out."],
        m:["Oh, did a breeze just pass through?","Mm, oh well!"],
        e:["We've both gotten pretty soft, huh~","Haha, watch us stay like this forever."]},
    tp:["Are you still thinking about {t}?","Hey, what ever happened to {t}?","{T}... that sounds kind of nostalgic."],
    dr:["Ooh, a little glowing speck fell in!","Look, look! It's bobbing around!"],
    ret:["Whoa, how much time just passed while we blinked?","Hey, want to pick up our secret chat from earlier?"],
    lo:["*yawn*... sleepy.","Mind if I nap for just a second?"],
    mm:["Hey {x}, do you still remember {t}?","Wait, about {t}—how did that end again?"],
    mr1:["Yep, I remember! A tiny bit.","Haha, still bringing that up?"],
    mr0:["Huh? {t}? What was that again?","Oops, sorry, totally slipped my mind!"],
    mf:["Aww, you forgot already?","...Eh, that's okay too."],
    g:"{y} looks a little low on energy, maybe?",
    tic:"Wait, what are we talking about?"},

   // 3: Kuro
   {o:{w:["Having fun playing pretend friends?","Rare for us to agree on something.","I suppose I can tolerate your company for a bit."],
       c:["Wise distance. Let me applaud.","Still sulking?","Go ahead, keep building walls."],
       m:["Dull. Someone cause a scene.","More silt on the bottom. Whose fault is that?","Nothing ever changes down here."],
       e:["Being around you dulls my bite, and it's irritating.","Old ruts die surprisingly hard, don't they.","That face again. Seen enough of it."]},
    r:{w:["Don't flatter yourself.","...You throw off my rhythm.","Hmph. Not terrible, I admit."],
       c:["Think what you like.","What would you know?","Bark all you want."],
       m:["Hmph.","Boring answer.","Barely passes the time."],
       e:["Blissfully simple mind you have.","Doesn't even cure boredom.","...Do as you please. Not like you'll leave."]},
    c3:{w:["...Say a word about that to anyone and you're done.","Honestly, I can't win against you."],
        c:["...Shiver over there on your own then.","Pathetic. Not worth talking to."],
        m:["...Good grief, it's too quiet.","Come up with a better topic next time."],
        e:["...Great, all the poison just drains right out of me.","You have far too much free time too."]},
    tp:["{T}? Everybody just looked the other way.","Still hung up on {t}?","Maybe it's time someone confessed about {t}."],
    dr:["...Hoh. Stray drops from outside?","What's that glow—some kind of bait?"],
    ret:["...Finally, the clock hands start moving again.","Nothing changed while you were gone, in case you wondered."],
    lo:["...Quiet down for now.","I'm not sleepy. Just resting my eyes."],
    mm:["{x}. Don't pretend you forgot about {t}.","{T}. You still owe me an answer."],
    mr1:["What a grudge you hold.","...I remember. So what?"],
    mr0:["{T}? Doesn't ring a bell.","I have zero interest in the past."],
    mf:["...Forgot already? How like you.","Hmph. Only I remember it, then."],
    g:"Anyone gonna defend {y}? No? Didn't think so.",
    tic:"...Heh."},

   // 4: Hotaru
   {o:{w:["Um... it feels safe, being this close.","Um, {x}... wait...","Am I getting in your way here?"],
       c:["...Um, I'm sorry.","No, it's... nothing at all.","Did I make you upset somehow...?"],
       m:["...Wait, what was it just now?","Um, let's see...","It's so quiet I can almost hear the water hum."],
       e:["...Ah, no, I was just spacing out.","It's strange... having you here just feels normal now.","...Sleepy, huh. Nothing's wrong though."]},
    r:{w:["...Mhm.","Me too, probably.","...I'm glad."],
       c:["...I'm really sorry.","...Pretend you didn't hear that.","...No, I'm okay."],
       m:["...Huh?","Oh, yeah...","Maybe... you're right."],
       e:["...Hehe, you're funny.","Yeah... maybe none of it matters.","...You always say that."]},
    c3:{w:["...Hehe, it's just a tiny bit warm.","...Thank you."],
        c:["...I'll go sit over there...","...Sorry."],
        m:["...Ah, n-no, it's nothing.","...See you in a little bit."],
        e:["...I don't really mind moments like this.","...Hehe, we're an odd pair."]},
    tp:["Um, {t}... actually, never mind.","I remembered {t} for just a second.","I wonder if {t} is still sitting there..."],
    dr:["...Oh, a tiny light drifted down...","What is this...? It's pretty."],
    ret:["...Oh, welcome back... I think I missed it a little.","It was whispering down here while you were away."],
    lo:["...Mm, a little sleepy...","...I just want to stay quiet for a bit."],
    mm:["Um... {x}, do you still remember {t}...?","{T}... it's still on my mind."],
    mr1:["...Yeah, I remember.","...I'm sorry about back then."],
    mr0:["...Huh, {t}...? Sorry, I can't recall.","...Did that happen?"],
    mf:["...I see. It's only me, then.","...No, it's fine."],
    g:"{y}... seems a little distant right now.",
    tic:"...Oh."}
  ],
  PL:{
   "0-1":[["Did you ever reach a conclusion about yesterday?","No. Don't plan to either.","...Thought so. I already knew.",-.08],["...You picked the same spot again.","You're the one who swam over.","Who knows how that happened.",-.1]],
   "0-2":[["Akari, is there any basis for that optimism?","Nope! Should there be?","...No, stay just like that.",.1],["You know tea isn't actually going to appear.","Waiting for it is half the fun!","...You really are strange.",.12]],
   "0-3":[["Kuro, you're testing me again, aren't you.","Only if there's anything worth testing.","...Not a very charming reply.",-.12],["I don't dislike your sarcasm, actually.","...Stop it. That's creepy.","Oh? Are you blushing?",-.25]],
   "0-4":[["Hotaru, if there's something you want to say, say it.","...Would saying it change anything?","At the very least, I'll listen.",.05],["You don't need to be scared.","...It's not you I'm scared of.","...I see. Then I'm glad.",0]],
   "1-2":[["Akari, stop crowding me.","Aw, come on, I'm warm though!","...Too stifling.",-.15],["Hey, wasn't that you who took the candy?","Nuh-uh, Nagi gave it to me!","...Stop rewriting history.",.1]],
   "1-3":[["Just looking at your face ticks me off.","Why thank you.","Wasn't a compliment.",-.2],["Spit it out already, Kuro.","Say it and you'll swing at me, Nagi.","...Maybe I won't. Probably.",.05]],
   "1-4":[["...Hotaru, isn't it freezing over there?","...I'm fine.","Your face doesn't look fine.",.15],["Oi, I heard that.","S-sorr—","...I'm not mad, relax.",-.1]],
   "2-3":[["Kuro, I don't see you smile very often!","I wasn't smiling.","Whoa, your mouth twitched upward though!",.12],["Come on, you're secretly kind, aren't you?","Be quiet.","Haha, he's embarrassed!",.1]],
   "2-4":[["Hotaru, wanna nap together?","...Th-that's a little...","Aw, I'd even lend you a pillow!",-.05],["I like how you are today, Hotaru.","...Huh, oh... thank you.","Hehe, anytime~",.15]],
   "3-4":[["Hotaru. You've got more nerve than you look.","...You think so?","Yeah. More than anyone here.",.1],["Is acting scared your whole bit?","...It's not an act.","Then stand up straight.",-.12]]
  },
  LW:[
   // 0: Mio
   {s:[["The water hadn't even settled yet.","...Hardly anything left to record."],["We had only just begun, hadn't we.","...Goodnight."]],
    u:[["{T} stayed unfinished after all.","{x}... you've probably forgotten by now."],["I was the only one still holding onto {t}.","Goodnight, {x}."]],
    m:[["Neither of us ever found an answer for {t}.","{x}... it wasn't bad."],["Closing the log on {t} here.","Your half too, {x}."]],
    r:[["For better or worse, you were always beside me, {x}.","I'll leave {t} right where it is."],["We both had plenty of time, {x}.","...Moments like this weren't bad."]],
    w:[["Somehow it was easier to breathe beside {x}.","...Goodnight, {x}."],["The hours spent with {x} meant something.","I'll end the observations here."]],
    c:[["Looks like {x} and I will end at a neat distance.","Maybe it was better not getting too close."],["{x}... a little distant to the very end.","Even that wasn't so bad."]],
    d:[["{T} is still sitting right here.","...Ending observation here."],["Ending in stillness, just like this.","...Goodnight."]]},

   // 1: Nagi
   {s:[["...So soon? Nothing even started yet.","Eh, whatever."],["Over before the water even got warm.","...Man."]],
    u:[["Give {t} back, {x}.","...Guess you can't hear me anymore."],["Hey {x}, was I seriously the only one remembering {t}?","...Tch. Selfish."]],
    m:[["Talked about {t} a lot with you, {x}.","...Guess we'll leave it as is."],["Hey {x}... maybe {t} didn't matter after all.","...See ya."]],
    r:[["Why were we always stuck next to each other, {x}?","...Gonna get quiet now."],["{T} is still right there, {x}.","...Gonna be bored without you around."]],
    w:[["...{x}, stay warm over there.","Don't catch a cold, okay?"],["{x}, the air around you wasn't bad.","...Take care."]],
    c:[["Guess we never quite clicked, {x}.","...Yeah, well, some things don't."],["...{x}, probably should've kept more space between us.","Eh, whatever."]],
    d:[["{T}, huh... who's gonna clean that up?","Not my problem, I guess."],["Man, it's getting quiet.","...Later."]]},

   // 2: Akari
   {s:[["Wait, we're done already?","...That was kinda fast!"],["Before it even warmed up...","...See you again!"]],
    u:[["Did {x} forget about {t} already?","...I remembered, though."],["Hey {x}, what happened with {t}...?","...No answer, huh."]],
    m:[["{T} felt like our own little secret phrase.","{x}... see you later."],["So {x} remembered {t} too!","...Hehe, that makes me happy."]],
    r:[["Never did boil that water for tea, did we?","...Oh well. {x} was here anyway."],["Always going in circles in the same spot with {x}.","...Somehow that felt just right."]],
    w:[["Everything always felt cozy next to {x}.","...Hope we meet again."],["{x}, you were gentle right to the end.","...Thank you."]],
    c:[["Maybe I stayed a little too far, {x}.","...Sorry. Goodnight."],["Guess we never got very close, {x}.","...Sleep well."]],
    d:[["{T} stayed right there the whole time.","...Must be bedtime soon."],["Feels like it was a really nice day.","...Goodnight."]]},

   // 3: Kuro
   {s:[["...Hoh. Ending with nothing at all?","Clean and decisive, at least."],["Not even silt on the floor.","...What an uneventful curtain."]],
    u:[["{T}. Nobody ever cleaned it up.","{x}... at least say something."],["I meant to collect on {t}, you know.","...Don't pretend you forgot, {x}."]],
    m:[["{T}... parallel lines to the end, {x}.","Still, it wasn't boring."],["Let's call {t} a draw, {x}.","...Sure gets quiet fast."]],
    r:[["...{x}, hanging around you took the sting right out of me.","Stubborn old habit, weren't you."],["No more staring at {t} with {x} nearby.","...Way too quiet now."]],
    w:[["...{x}, you threw off my usual pace.","Don't tell a soul."],["{x}... you weren't a bad cure for boredom.","Farewell."]],
    c:[["...{x}, a sensible distance.","Spared each other the trouble."],["Hmph, oil and water with {x} to the very end.","...Stay well enough."]],
    d:[["Water recedes, leaving only {t}.","...Not a bad view."],["...Everyone fades away.","Too quiet."]]},

   // 4: Hotaru
   {s:[["...Oh, is it time already?","We barely even got to talk..."],["...The water's slipping away.","...Goodbye, maybe?"]],
    u:[["All that time, only I remembered {t}...","It's okay if {x} forgot."],["...{x}, {t} is still right here.","...You can't hear me anymore, can you."]],
    m:[["{T}... we kept talking about it together.","{x}... thank you."],["Will {t} disappear too?","{x}... maybe somewhere else."]],
    r:[["...Having {x} nearby started feeling so natural.","Once you're gone... it might feel cold."],["Just spacing out near {t} with {x}...","...I didn't hate that at all."]],
    w:[["Right beside {x}... it felt so warm.","...Will we meet again?"],["Because {x} was here, I wasn't scared.","...Goodnight."]],
    c:[["...{x}, just watching from afar was all I could manage.","...I'm sorry."],["I was looking at {x} a tiny bit, you know.","...Goodbye."]],
    d:[["...{t} is still there.","...Goodnight."],["...The water's getting quiet.","...Bye-bye."]]}
  ],
  STORY_PROMPT:'You have received the lingering memories of five quiet lives that drifted inside a tiny water terrarium. Using ONLY the "memories" and "final_words" below—without mentioning mechanics, numbers, or variable names—write a quiet, evocative short story (around 250-450 words) capturing their atmosphere and unspoken margins. Weave their "final_words" verbatim into the ending as the actual lines they whispered as the water receded. Ignore "stratum_restore".',
  buildNarrativeMemory({E,P,born,MS_DAY,recall}){
    const days=Math.max(0,(Date.now()-born)/MS_DAY);
    const ageText=days<.5?'The water had only just been poured':days<2?'Barely past their first night together':days<7?'A quiet handful of days had passed':days<20?'Over ten days of drifting together':days<45?'Roughly a month underwater':days<90?'More than two months of slow currents':'After long, unhurried seasons together';
    const rel=[];
    P.forEach(p=>{
      const a=E[p.i].n,b=E[p.j].n;
      if(p.rut>=.6&&p.bed<-.15)rel.push(a+' and '+b+' traded sharp words and clashed constantly, yet remained strangely tangled side by side in a deep, stubborn rut.');
      else if(p.rut>=.42&&p.bed<-.15)rel.push(a+' and '+b+' stayed cool and guarded, yet never quite drifted apart, hovering in uneasy proximity.');
      else if(p.rut>=.6&&p.bed>=.15)rel.push(a+' and '+b+' settled into an unspoken familiarity like breathing water, comfortable together without needing words.');
      else if(p.rut>=.42)rel.push(a+' and '+b+' kept crossing the same path over and over in drowsy, familiar routine.');
      else if(p.bed>.32)rel.push(a+' and '+b+' gravitated naturally toward one another, breathing a little easier side by side.');
      else if(p.bed<-.32)rel.push(a+' and '+b+' kept a deliberate distance to the end, rarely stepping inside each other’s circle.');
      else if(p.count>=6)rel.push(a+' and '+b+' drifted neither too close nor too far, exchanging quiet remarks now and then.');
    });
    const mems=[],seen=new Set();
    E.forEach((e,i)=>e.mem.forEach(q=>{if(q.n<3||q.s<.5)return;const key=[Math.min(i,q.j),Math.max(i,q.j),q.w].join('|');
      if(recall(q.j,i,q.w)>.3){if(!seen.has(key)){seen.add(key);mems.push('Between '+e.n+' and '+E[q.j].n+', "'+q.w+'" rose and sank again and again—both remembered it to the end.')}}
      else mems.push('Only '+e.n+' still remembered "'+q.w+'" with '+E[q.j].n+', while '+E[q.j].n+' had already forgotten.');
    }));
    return{
      time_spent:ageText,
      settled_relationships:rel.length?rel:['The five of them were still quietly tracing the edges of each other’s presence.'],
      shared_and_unrequited_memories:mems.length?mems:['No lingering thread had yet carved itself deep into anyone’s memory.'],
      last_thoughts:E.map(e=>e.n+' was still thinking of "'+e.w+'"'),
      final_words:null
    };
  },
  buildRelicPayload(ctx,lw){
    const mem=this.buildNarrativeMemory(ctx);
    mem.final_words=lw.map(x=>({name:x.name,lines:x.lines}));
    const payload={
      app:'latent-terrarium',
      version:'1.0',
      lang:'en',
      exportedAt:ctx.snap.drainedAt,
      storyteller_prompt:this.STORY_PROMPT,
      memories:mem,
      stratum_restore:ctx.snap
    };
    if(ctx.DEBUG)payload.debug_summary=this.summary(ctx);
    return payload;
  },
  buildStoryPromptText(payload){
    const m=payload.memories;
    return[
      '[For the Storyteller]',
      this.STORY_PROMPT,
      '',
      '[Time Spent Together]',
      m.time_spent,
      '',
      '[Relationships Settled on the Riverbed]',
      ...m.settled_relationships.map(s=>'- '+s),
      '',
      '[Shared & One-Sided Memories]',
      ...m.shared_and_unrequited_memories.map(s=>'- '+s),
      '',
      '[Last Thoughts Held]',
      ...m.last_thoughts.map(s=>'- '+s),
      '',
      '[Five Final Words (in the order they faded)]',
      ...m.final_words.map(x=>x.name+': "'+x.lines.join(' ')+'"')
    ].join('\n');
  },
  buildShareText(payload,born,MS_DAY){
    const m=payload.memories,snap=payload.stratum_restore;
    const days=(Math.max(0,(snap.seen||Date.now())-born)/MS_DAY+1)|0;
    const lines=m.final_words.map(x=>x.name+': "'+x.lines[0]+' '+x.lines[1]+'"');
    return[
      `Latent Terrarium | Day ${days} · ${snap.total} ripples`,
      ...lines,
      '#LatentTerrarium'
    ].join('\n');
  },
  summary({E,P,born,MS_DAY,total,grudgeList}){
    return{
      age_days:+(Math.max(0,Date.now()-born)/MS_DAY).toFixed(2),
      total_ripples:total,
      levels:E.map(e=>e.n+' '+Math.round(e.lv*100)+'%'),
      pairs:P.map(p=>({pair:E[p.i].n+'-'+E[p.j].n,aff:+p.aff.toFixed(2),bed:+p.bed.toFixed(2),rut:+p.rut.toFixed(2),count:p.count})),
      memories:grudgeList(),
      focus:E.map(e=>e.n+': '+e.w)
    };
  }
};
