/* Venture Splash Clean — não usa localStorage, MQTT, dados do jogo ou pontuação. */
(function(){
  'use strict';
  var screen=document.getElementById('ventureSplash');
  if(!screen)return;
  var preview=document.body.getAttribute('data-venture-intro-preview')==='true';
  var force=/[?&]intro=1(?:&|$)/.test(location.search);
  var seen=false;
  if(!preview && !force){try{seen=sessionStorage.getItem('venture_splash_clean_tab_v1')==='shown';}catch(_){}}
  if(seen){screen.remove();return;}
  var skipped=false,done=false,elapsed=false,ready=document.readyState!=='loading';
  var actionSkip=screen.querySelector('[data-vs-skip]');
  var actionSound=screen.querySelector('[data-vs-sound]');
  function finish(){
    if(done)return;
    done=true;
    if(!preview){try{sessionStorage.setItem('venture_splash_clean_tab_v1','shown');}catch(_){}}
    screen.classList.add('vs-leaving');screen.setAttribute('aria-hidden','true');
    setTimeout(function(){screen.remove();},680);
  }
  function maybeFinish(){if((elapsed&&ready)||skipped)finish();}
  if(!ready)document.addEventListener('DOMContentLoaded',function(){ready=true;maybeFinish();},{once:true});
  setTimeout(function(){elapsed=true;maybeFinish();},3100);
  /* Mesmo se algum script externo travar o carregamento, nunca prender o usuário. */
  setTimeout(finish,7000);
  if(actionSkip)actionSkip.addEventListener('click',function(){skipped=true;maybeFinish();});
  screen.addEventListener('keydown',function(ev){if(ev.key==='Escape'){ev.preventDefault();skipped=true;maybeFinish();}});
  var soundEnabled=false;
  function playNote(ctx,freq,when,duration){
    var oscillator=ctx.createOscillator(),volume=ctx.createGain();
    oscillator.type='sine';oscillator.frequency.setValueAtTime(freq,when);
    volume.gain.setValueAtTime(.0001,when);
    volume.gain.exponentialRampToValueAtTime(.038,when+.04);
    volume.gain.exponentialRampToValueAtTime(.0001,when+duration);
    oscillator.connect(volume);volume.connect(ctx.destination);
    oscillator.start(when);oscillator.stop(when+duration+.03);
  }
  if(actionSound)actionSound.addEventListener('click',function(){
    var AudioContextCtor=window.AudioContext||window.webkitAudioContext;
    if(!AudioContextCtor){actionSound.textContent='Som indisponível';actionSound.disabled=true;return;}
    if(soundEnabled){soundEnabled=false;actionSound.setAttribute('aria-pressed','false');actionSound.textContent='♪ Ativar som';return;}
    soundEnabled=true;actionSound.setAttribute('aria-pressed','true');actionSound.textContent='♪ Som ativado';
    /* O navegador só permite som após clique; não há reprodução automática. */
    try{var ctx=new AudioContextCtor();if(ctx.state==='suspended')ctx.resume();
      var t=ctx.currentTime+.03;playNote(ctx,392,t,.22);playNote(ctx,523.25,t+.15,.34);
      setTimeout(function(){if(ctx.close)ctx.close().catch(function(){});},1100);
    }catch(_){actionSound.textContent='Som indisponível';}
  });
})();
