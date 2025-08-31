// ===== Theme handling =====
const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
const themeSwitch = document.querySelector('.theme-switch');
function applyTheme(light){
  document.documentElement.classList.toggle('light', !!light);
  if(themeSwitch) themeSwitch.checked = !light;
}
applyTheme(localStorage.getItem('theme') === 'light' || prefersLight);
if(themeSwitch){
  themeSwitch.addEventListener('change', ()=>{
    const light = !themeSwitch.checked;
    localStorage.setItem('theme', light? 'light':'dark');
    applyTheme(light);
  });
}

// ===== Helpers =====
function $(sel,root=document){ return root.querySelector(sel) }
function $all(sel,root=document){ return Array.from(root.querySelectorAll(sel)) }
function notify(msg){
  const t = $('.toast'); if(!t) return;
  t.textContent = msg; t.classList.add('show'); clearTimeout(notify._t);
  notify._t = setTimeout(()=> t.classList.remove('show'), 2200);
}

function setBusy(btn, busy, txtEl){
  if(!btn) return; btn.disabled = !!busy;
  if(txtEl) txtEl.textContent = busy || '';
}

// ===== Password strength & toggles =====
function passwordScore(p){
  if(!p) return 0; let s = 0;
  if(p.length >= 6) s += 25; if(p.length >= 10) s += 15;
  if(/[A-Z]/.test(p)) s += 20; if(/[a-z]/.test(p)) s += 10;
  if(/[0-9]/.test(p)) s += 15; if(/[^\w]/.test(p)) s += 15;
  return Math.min(100, s);
}
function enablePasswordUI(scope=document){
  const pwd = $('#password', scope);
  const bar = $('#pwdBar', scope);
  const caps = $('#capsHint', scope);
  const toggle = $('#togglePwd', scope);
  if(!pwd) return;
  pwd.addEventListener('input', ()=>{ if(bar) bar.style.width = passwordScore(pwd.value)+'%'; });
  pwd.addEventListener('keydown', e=> caps && caps.classList.toggle('on', e.getModifierState && e.getModifierState('CapsLock')));
  pwd.addEventListener('keyup', e=> caps && caps.classList.toggle('on', e.getModifierState && e.getModifierState('CapsLock')));
  if(toggle){ toggle.addEventListener('click', ()=>{ pwd.type = pwd.type === 'password' ? 'text' : 'password'; }); }
}

// ===== Remember email (login) =====
function enableRememberEmail(scope=document){
  const remember = $('#remember', scope);
  const emailEl = $('#email', scope);
  const saved = localStorage.getItem('remember_email');
  if(emailEl && saved){ emailEl.value = saved; if(remember) remember.checked = true; }
  if(remember){
    remember.addEventListener('change', ()=>{
      if(remember.checked && emailEl.value) localStorage.setItem('remember_email', emailEl.value);
      else localStorage.removeItem('remember_email');
    });
  }
  if(emailEl){ emailEl.addEventListener('input', ()=>{ if(remember && remember.checked) localStorage.setItem('remember_email', emailEl.value); }); }
}

// ===== Fake API =====
function fakeLogin(email, password){
  return new Promise((resolve, reject)=>{
    setTimeout(()=>{
      const ok = email.toLowerCase() === 'demo@deyyymore.com' && password === 'Senha@123';
      ok ? resolve({token:'jwt.demo', user:{email}}) : reject(new Error('E-mail ou senha incorretos. Use demo@deyyymore.com / Senha@123'));
    }, 800);
  });
}
function fakeRegister(payload){
  return new Promise((resolve, reject)=>{
    setTimeout(()=>{
      if(!payload || !payload.email || payload.password?.length < 6) reject(new Error('Dados inválidos.'));
      else resolve({ok:true, id: Date.now(), user:{email:payload.email}});
    }, 900);
  });
}

// ===== Page behaviors =====
document.addEventListener('DOMContentLoaded', ()=>{
  // Login page
  if(document.body.dataset.page === 'login'){
    enablePasswordUI(); enableRememberEmail();
    const form = $('#loginForm'); const btn = $('#submitBtn'); const status = $('#statusText'); const dot = $('#statusDot');
    form.addEventListener('submit', async (e)=>{
      e.preventDefault(); if(!form.reportValidity()) return;
      setBusy(btn, true, status); status.textContent = 'Validando credenciais…'; dot.style.background = 'var(--warn)';
      const email = $('#email').value.trim(); const password = $('#password').value;
      try{ await fakeLogin(email, password); status.textContent='Login realizado!'; dot.style.background='var(--ok)'; notify('✅ Bem-vindo!'); setTimeout(()=> location.href='index.html', 700); }
      catch(err){ status.textContent = err.message; dot.style.background='var(--err)'; notify('❌ '+err.message); }
      finally{ setBusy(btn, false); }
    });
  }

  // Cadastro page
  if(document.body.dataset.page === 'signup'){
    enablePasswordUI();
    const form = $('#signupForm'); const btn = $('#submitBtn'); const status = $('#statusText'); const dot = $('#statusDot');
    const email = $('#email'); const pwd = $('#password'); const confirm = $('#confirm'); const name = $('#name'); const terms = $('#terms');
    form.addEventListener('submit', async (e)=>{
      e.preventDefault(); if(!form.reportValidity()) return;
      if(pwd.value !== confirm.value){ notify('⚠️ As senhas não coincidem.'); confirm.setCustomValidity('As senhas não coincidem'); confirm.reportValidity(); return; } else { confirm.setCustomValidity(''); }
      if(!terms.checked){ notify('⚠️ Você precisa aceitar os termos.'); return; }
      setBusy(btn, true, status); status.textContent = 'Criando sua conta…'; dot.style.background = 'var(--warn)';
      try{ await fakeRegister({email: email.value.trim(), password: pwd.value, name: name.value.trim()}); status.textContent='Conta criada!'; dot.style.background='var(--ok)'; notify('🎉 Cadastro concluído! Redirecionando…'); setTimeout(()=> location.href='login.html', 900); }
      catch(err){ status.textContent = err.message; dot.style.background='var(--err)'; notify('❌ '+err.message); }
      finally{ setBusy(btn, false); }
    });
  }
});
