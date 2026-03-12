// Se já estiver logado, joga pro painel
if (sessionStorage.getItem('token_cv')) {
  window.location.href = '/index.html';
}

function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active-form'));

  if (tab === 'login') {
    document.querySelectorAll('.auth-tab')[0].classList.add('active');
    document.getElementById('loginForm').classList.add('active-form');
  } else {
    document.querySelectorAll('.auth-tab')[1].classList.add('active');
    document.getElementById('registerForm').classList.add('active-form');
  }
}

async function handleAuth(e, action) {
  e.preventDefault();

  const errorMsg = document.getElementById(action === 'login' ? 'loginError' : 'regError');
  errorMsg.textContent = '';

  let payload = {};
  if (action === 'login') {
    payload = {
      email: document.getElementById('loginEmail').value,
      senha: document.getElementById('loginSenha').value,
    };
  } else {
    payload = {
      nome: document.getElementById('regNome').value,
      email: document.getElementById('regEmail').value,
      senha: document.getElementById('regSenha').value,
    };
  }

  try {
    const res = await fetch(`/api/auth/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Erro de autenticação');
    }

    // Sucesso: salvar token e vendedor
    sessionStorage.setItem('token_cv', data.token);
    localStorage.setItem('vendedor_cv', JSON.stringify(data.vendedor));

    window.location.href = '/index.html';

  } catch (err) {
    errorMsg.textContent = err.message;
  }
}

window.switchTab = switchTab;
window.handleAuth = handleAuth;
