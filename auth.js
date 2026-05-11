// ─── CONFIG ────
const API_BASE = "/api";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── DOM REFS ────
const authButtons = document.getElementById("auth-buttons");
const userInfo = document.getElementById("user-info");
const welcomeText = document.getElementById("welcome-text");
const logoutBtn = document.getElementById("logout-btn");

const tabBtns = document.querySelectorAll(".tab-btn");
const loginTab = document.getElementById("login-tab");
const registerTab = document.getElementById("register-tab");

// Login fields
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const loginMsg = document.getElementById("login-msg");
const loginBtn = document.getElementById("login-btn");

// Register fields
const regName = document.getElementById("reg-name");
const regEmail = document.getElementById("reg-email");
const regPassword = document.getElementById("reg-password");
const registerMsg = document.getElementById("register-msg");
const registerBtn = document.getElementById("register-btn");

// ─── HELPERS ────
function switchTab(tab) {
  tabBtns.forEach((b) =>
    b.classList.toggle("active", b.dataset.tab === tab)
  );

  loginTab.style.display = tab === "login" ? "block" : "none";
  registerTab.style.display = tab === "register" ? "block" : "none";
}

function clearMessages() {
  loginMsg.textContent = "";
  loginMsg.className = "form-msg";

  registerMsg.textContent = "";
  registerMsg.className = "form-msg";
}

function setMsg(el, text, type = "error") {
  el.textContent = text;
  el.className = `form-msg ${type}`;
}

function setLoading(btn, loading) {
  btn.disabled = loading;
  btn.textContent = loading ? "Please wait..." : btn.dataset.label;
}

// ─── TAB SWITCHING ────
tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    clearMessages();
    switchTab(btn.dataset.tab);
  });
});

// ─── LOGIN ────
loginBtn.dataset.label = "Login";

loginBtn.addEventListener("click", async () => {
  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  if (!email || !password) {
  return setMsg(loginMsg, "Please fill in all fields.");
}

if (!isValidEmail(email)) {
  return setMsg(loginMsg, "Please enter a valid email.");
}

  setLoading(loginBtn, true);

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return setMsg(loginMsg, data.message || "Login failed");
    }

    localStorage.setItem("golf_token", data.token);
    localStorage.setItem("golf_user", JSON.stringify(data.user));

    setMsg(loginMsg, `Welcome back, ${data.user.name}! 🎉`, "success");

    setTimeout(() => {
      checkAuthState();
    }, 1000);

  } catch (err) {
    console.error(err);
    setMsg(loginMsg, "Server error. Is backend running?");
  } finally {
    setLoading(loginBtn, false);
    loginBtn.textContent = "Login";
  }
});

// ─── REGISTER ────
registerBtn.dataset.label = "Create Account";

registerBtn.addEventListener("click", async () => {
  const name = regName.value.trim();
  const email = regEmail.value.trim();
  const password = regPassword.value;

if (!name || !email || !password) {
  return setMsg(registerMsg, "Please fill in all fields.");
}

if (!isValidEmail(email)) {
  return setMsg(registerMsg, "Please enter a valid email.");
}

if (password.length < 6) {
  return setMsg(registerMsg, "Password must be at least 6 characters.");
}

  setLoading(registerBtn, true);

  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return setMsg(registerMsg, data.message || "Registration failed");
    }

    setMsg(registerMsg, "Account created successfully! 🎉", "success");

    regName.value = "";
    regEmail.value = "";
    regPassword.value = "";

    setTimeout(() => {
      switchTab("login");
    }, 1500);

  } catch (err) {
    console.error(err);
    setMsg(registerMsg, "Server error. Is backend running?");
  } finally {
    setLoading(registerBtn, false);
    registerBtn.textContent = "Create Account";
  }
});

// ─── LOGOUT ────
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("golf_token");
    localStorage.removeItem("golf_user");

    checkAuthState();
  });
}

// ─── AUTH STATE ────
function checkAuthState() {
  const token = localStorage.getItem("golf_token");
  const user = JSON.parse(localStorage.getItem("golf_user") || "null");

  if (token && user) {
    // Logged In
    document.getElementById("auth-gate").style.display = "none";
    document.getElementById("main").style.display = "block";
    document.getElementById("nav").style.display = "flex";

    if (authButtons) authButtons.style.display = "none";

    userInfo.style.display = "flex";
    welcomeText.textContent = `👋 ${user.name}`;

  } else {
    // Not Logged In
    document.getElementById("auth-gate").style.display = "flex";
    document.getElementById("main").style.display = "none";
    document.getElementById("nav").style.display = "none";
  }
}

// ─── INITIAL LOAD ────
checkAuthState();