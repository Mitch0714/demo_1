(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const form = $('#login'), email = $('#email'), password = $('#password');
  const status = $('.status'), submit = form.querySelector('.submit');
  let mode = 'login', busy = false;
  const touched = new Set();
  const demo = { email: 'alex@example.com', password: 'FormaDemo!2026' };
  const nameField = document.createElement('div');
  nameField.className = 'field';
  nameField.innerHTML = '<label for="name">Full name</label><input id="name" name="name" type="text" autocomplete="name" placeholder="Your full name" maxlength="100">';
  form.prepend(nameField);
  const name = $('#name');
  const confirmField = document.createElement('div');
  confirmField.className = 'field';
  confirmField.innerHTML = '<label for="confirm">Confirm password</label><input id="confirm" name="confirm" type="password" autocomplete="new-password" placeholder="Re-enter your password">';
  $('.options').before(confirmField);
  const confirm = $('#confirm');
  const fields = [name, email, password, confirm];
  fields.forEach(input => {
    const error = document.createElement('p');
    error.id = input.id + '-error'; error.className = 'field-error';
    error.setAttribute('aria-live', 'polite');
    input.closest('.field').append(error);
    input.setAttribute('aria-describedby', error.id);
    input.setAttribute('aria-invalid', 'false');
  });
  const rules = document.createElement('ul');
  rules.className = 'rules'; rules.id = 'password-rules';
  rules.innerHTML = '<li>12+ characters</li><li>One letter</li><li>One number</li><li>One symbol</li>';
  password.closest('.field').append(rules);
  const caps = document.createElement('p'); caps.className='hint caps'; caps.hidden=true; caps.textContent='Caps Lock is on.'; caps.id='caps-hint';
  password.closest('.field').append(caps);
  const demoBar = document.createElement('div'); demoBar.className='demo-bar';
  demoBar.innerHTML='<span>Interactive demo · No real accounts</span><button type="button">Try demo account</button>';
  form.after(demoBar);
  const back=document.createElement('button');back.type='button';back.className='back';back.textContent='Back to sign in';form.after(back);
  const account=document.createElement('div');account.hidden=true;form.before(account);
  email.maxLength=254;email.autocapitalize='none';email.spellcheck=false;
  password.maxLength=128;confirm.maxLength=128;
  function activeFields(){return mode==='register'?fields:mode==='reset'?[email]:[email,password];}
  function checks(value){return [value.length>=12,/[a-z]/i.test(value),/\d/.test(value),/[^a-z\d\s]/i.test(value)];}
  function errorFor(input){
    const value=input.value;
    if(input===name)return !value.trim()?'Enter your name.':value.trim().length<2?'Use at least 2 characters.':'';
    if(input===email)return !value.trim()?'Enter your email address.':!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())?'Enter a valid email, like you@example.com.':'';
    if(input===password){if(!value)return 'Enter your password.';if(mode==='register'&&!checks(value).every(Boolean))return 'Your password needs to meet all four requirements.';return '';}
    return !value?'Confirm your password.':value!==password.value?'Your passwords don’t match.':'';
  }
  function validate(input){const message=errorFor(input);$('#'+input.id+'-error').textContent=message;input.setAttribute('aria-invalid',String(!!message));return !message;}
  function announce(message,type='error'){status.textContent=message;status.className='status '+type;}
  function clearStatus(){announce('','');}
  fields.forEach(input=>{
    input.addEventListener('blur',()=>{if(!busy&&activeFields().includes(input)){touched.add(input);validate(input);}});
    input.addEventListener('input',()=>{clearStatus();if(touched.has(input))validate(input);if(input===password){checks(password.value).forEach((ok,i)=>rules.children[i].classList.toggle('met',ok));if(touched.has(confirm)&&mode==='register')validate(confirm);}});
  });
  ['keydown','keyup'].forEach(event=>password.addEventListener(event,e=>{caps.hidden=!e.getModifierState('CapsLock');}));
  password.addEventListener('blur',()=>{caps.hidden=true;});
  $('.show').addEventListener('click',function(){const visible=password.type==='password';password.type=visible?'text':'password';this.setAttribute('aria-label',visible?'Hide password':'Show password');this.setAttribute('aria-pressed',String(visible));});
  function setMode(next,focus=true){
    if(busy)return;mode=next;touched.clear();clearStatus();account.hidden=true;form.hidden=false;
    nameField.hidden=next!=='register';confirmField.hidden=next!=='register';password.closest('.field').hidden=next==='reset';rules.hidden=next!=='register';$('.options').hidden=next!=='login';back.hidden=next==='login';demoBar.hidden=false;
    $('.google').hidden=next==='reset';$('.divider').hidden=next==='reset';$('.note').hidden=false;
    $('#welcome').textContent=next==='register'?'Find your everyday.':next==='reset'?'Forgot password?':'Welcome back.';
    $('.intro').textContent=next==='register'?'Create your account and make yourself at home.':next==='reset'?'Enter your email to start password recovery.':'Sign in for a little more of what you love.';
    submit.textContent=next==='register'?'Create account':next==='reset'?'Continue':'Sign in';
    password.value='';confirm.value='';password.type='password';$('.show').setAttribute('aria-label','Show password');$('.show').setAttribute('aria-pressed','false');
    password.autocomplete=next==='register'?'new-password':'current-password';
    password.setAttribute('aria-describedby',next==='register'?'password-error password-rules caps-hint':'password-error caps-hint');
    fields.forEach(input=>{input.disabled=false;input.setAttribute('aria-invalid','false');$('#'+input.id+'-error').textContent='';input.required=activeFields().includes(input);});
    checks('').forEach((_,i)=>rules.children[i].classList.remove('met'));
    document.title=next==='register'?'FORMA — Create account':next==='reset'?'FORMA — Reset password':'FORMA — Welcome back';
    if(focus)(next==='register'?name:email).focus();
  }
  function rememberEmail(){try{if(form.elements.remember.checked)localStorage.setItem('forma.rememberedEmail',email.value.trim());else localStorage.removeItem('forma.rememberedEmail');}catch{}}
  function showAccount(displayName){
    $('#welcome').textContent='You’re right at home.';$('.intro').textContent='Welcome, '+displayName+'.';
    form.hidden=true;$('.google').hidden=true;$('.divider').hidden=true;back.hidden=true;$('.note').hidden=true;account.hidden=false;
    account.innerHTML='<div class="account-card"><span class="pill">Demo session</span><strong></strong><p>Your account experience is ready to explore. This session is temporary; no real account has been created.</p></div><button class="submit" type="button">Sign out</button>';
    account.querySelector('strong').textContent=email.value.trim();account.querySelector('button').addEventListener('click',()=>{setMode('login');announce('You’ve signed out of the demo.','success');});
    $('#welcome').tabIndex=-1;$('#welcome').focus();password.value='';confirm.value='';
  }
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy)return;
    email.value=email.value.trim();const invalid=activeFields().filter(input=>{touched.add(input);return !validate(input);});
    if(invalid.length){clearStatus();invalid[0].focus();return;}
    busy=true;clearStatus();form.setAttribute('aria-busy','true');const label=submit.textContent;
    submit.disabled=true;fields.forEach(input=>input.disabled=true);
    submit.innerHTML='<span class="spinner" aria-hidden="true"></span>'+(mode==='register'?'Creating your demo…':mode==='reset'?'Checking details…':'Signing in…');
    await new Promise(resolve=>setTimeout(resolve,800));
    try{
      if(mode==='reset'){announce('Email format confirmed. Password recovery isn’t connected in this demo, so no email was sent. You can use “Try demo account” to explore.','success');status.focus();}
      else if(mode==='register'){showAccount(name.value.trim().split(/\s+/)[0]);}
      else if(email.value.toLowerCase()===demo.email&&password.value===demo.password){rememberEmail();showAccount('Alex');}
      else {announce('Email or password is incorrect. Please try again, or choose “Try demo account”.');status.focus();}
    }finally{busy=false;submit.disabled=false;submit.textContent=label;fields.forEach(input=>input.disabled=false);form.removeAttribute('aria-busy');}
  });
  demoBar.querySelector('button').addEventListener('click',()=>{if(busy)return;setMode('login',false);email.value=demo.email;password.value=demo.password;announce('Demo details filled in. Select Sign in to continue.','success');submit.focus();});
  back.addEventListener('click',()=>setMode('login'));
  $('[data-info="forgot"]').addEventListener('click',()=>setMode('reset'));
  const messages={google:['Google sign-in','Google sign-in is not connected yet. Use the demo account to explore the account experience.'],privacy:['Your privacy','This demo does not send sign-in details to a server or store passwords. “Remember my email” saves only your email on this device. Fonts load from Google.'],terms:['About this demo','FORMA is an interactive storefront concept. Demo sessions are temporary. Real accounts, email delivery and purchases are not connected.']};
  Object.keys(messages).forEach(key=>$('[data-info="'+key+'"]').addEventListener('click',()=>{if(busy)return;$('#dialog-title').textContent=messages[key][0];$('#dialog-text').textContent=messages[key][1];$('dialog').showModal();}));
  setMode('login',false);
  try{const saved=localStorage.getItem('forma.rememberedEmail');if(saved){email.value=saved;form.elements.remember.checked=true;}}catch{}
})();
