// ---- Tema claro/escuro ----
const themeSwitch = document.getElementById('themeSwitch');
const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
function applyTheme(light){ document.documentElement.classList.toggle('light', !!light); themeSwitch.checked = !light; }
applyTheme(localStorage.getItem('theme') === 'light' || prefersLight);
themeSwitch.addEventListener('change', () => { const light = !themeSwitch.checked; localStorage.setItem('theme', light? 'light':'dark'); applyTheme(light); });

// ---- Lembrar e-mail ----
const remember = document.getElementById('remember');
const emailEl = document.getElementById('email');
const savedEmail = localStorage.getItem('remember_email');
if(savedEmail){ emailEl.value = savedEmail; remember.checked = true; }
remember.addEventListener('change', () => {
  if(remember.checked && emailEl.value) localStorage.setItem('remember_email', emailEl.value);
  else localStorage.removeItem('remember_email');
});
emailEl.addEventListener('input', () => { if(remember.checked) localStorage.setItem('remember_email', emailEl.value); });

// ---- Mostrar/ocultar senha + força ----
const pwdEl = document.getElementById('password');
const togglePwd = document.getElementById('togglePwd');
const pwdBar = document.getElementById('pwdBar');
togglePwd.addEventListener('click', () => { pwdEl.type = pwdEl.type === 'password' ? 'text' : 'password'; });
pwdEl.addEventListener('input', () => {
  const s = score(pwdEl.value); pwdBar.style.width = s + '%';
});
function score(p){
  if(!p) return 0; let s = 0;
  if(p.length >= 6) s += 25; if(p.length >= 10) s += 15;
  if(/[A-Z]/.test(p)) s += 20; if(/[a-z]/.test(p)) s += 10;
  if(/[0-9]/.test(p)) s += 15; if(/[^\w]/.test(p)) s += 15;
  return Math.min(100, s);
}

// ---- Caps Lock detector ----
const capsHint = document.getElementById('capsHint');
pwdEl.addEventListener('keydown', e => { capsHint.classList.toggle('on', e.getModifierState && e.getModifierState('CapsLock')); });
pwdEl.addEventListener('keyup', e => { capsHint.classList.toggle('on', e.getModifierState && e.getModifierState('CapsLock')); });

// ---- Envio + mock de API ----
const form = document.getElementById('loginForm');
const submitBtn = document.getElementById('submitBtn');
const statusText = document.getElementById('statusText');
const statusDot = document.getElementById('statusDot');
const authCard = document.getElementById('authCard');
const toast = document.getElementById('toast');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if(!form.reportValidity()) return;

  setBusy(true, 'Validando credenciais…');
  const email = emailEl.value.trim();
  const password = pwdEl.value;

  try {
    const res = await fakeLogin(email, password);
    setBusy(false, 'Login realizado com sucesso!');
    statusDot.style.background = 'var(--ok)';
    notify('✅ Bem-vindo! Redirecionando…');
    setTimeout(() => {
      window.location.href = '#/dashboard';
    }, 800);
  } catch(err){
    setBusy(false, err.message || 'Falha ao entrar');
    statusDot.style.background = 'var(--err)';
    notify('❌ ' + (err.message || 'Credenciais inválidas'));
  }
});

// Submeter com Enter em qualquer campo
form.addEventListener('keydown', (e)=>{
  if(e.key === 'Enter' && !e.shiftKey){
    e.preventDefault();
    submitBtn.click();
  }
});

// Botões de provedores sociais (mock)
document.querySelectorAll('.prov').forEach(btn => btn.addEventListener('click', () => {
  notify('🔧 Integração com ' + btn.dataset.prov + ' não está configurada neste demo.');
}));

function setBusy(busy, text){
  submitBtn.disabled = !!busy;
  statusText.textContent = text || '';
  authCard.classList.toggle('busy', !!busy);
  statusDot.style.background = busy ? 'var(--warn)' : 'transparent';
}

function notify(msg){
  toast.textContent = msg; toast.classList.add('show');
  clearTimeout(notify._t); notify._t = setTimeout(()=> toast.classList.remove('show'), 2400);
}

// Simula uma chamada de API. Troque por fetch('https://sua-api/login', { method:'POST', body: JSON.stringify({...}) })
function fakeLogin(email, password){
  return new Promise((resolve, reject)=>{
    setTimeout(()=>{
      const ok = email.toLowerCase() === 'demo@deyyymore.com' && password === 'Senha@123';
      if(ok) resolve({token: 'jwt.demo.token', user:{email}});
      else reject(new Error('E-mail ou senha incorretos. Dica: veja as credenciais da dica.'));
    }, 900);
  });
}
