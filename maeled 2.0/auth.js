(function(){
  const SESSION_KEY = "maeled_session_v2";

  function setSession(session){
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  function getSession(){
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); }
    catch(e){ return null; }
  }
  function clearSession(){
    localStorage.removeItem(SESSION_KEY);
  }

  function redirectToLogin(fromAdmin){
    // from admin folder -> ../index.html else index.html
    const target = fromAdmin ? "../index.html" : "index.html";
    window.location.href = target;
  }

  window.MaeledAuth = {
    getSession,
    logout: function(fromAdmin=false){
      clearSession();
      redirectToLogin(fromAdmin);
    },
    requireRole: function(role){
      const s = getSession();
      const isAdminFolder = window.location.pathname.includes("/admin/");
      if(!s){ redirectToLogin(isAdminFolder); return null; }
      if(role && s.role !== role){
        // role mismatch -> logout then login
        clearSession();
        redirectToLogin(isAdminFolder);
        return null;
      }
      return s;
    },
    login: function(role, email, password){
      const users = [
        { role:"admin", email:"admin@app.com", password:"admin123", name:"Admin" },
        { role:"user",  email:"user@app.com",  password:"user123",  name:"User" },
      ];
      const u = users.find(x => x.role===role && x.email===email && x.password===password);
      if(!u) return { ok:false, message:"Identifiants invalides" };
      setSession({ role:u.role, email:u.email, name:u.name, at: Date.now() });
      return { ok:true, session:getSession() };
    }
  };

  document.addEventListener("DOMContentLoaded", function(){
    const isAdminFolder = window.location.pathname.includes("/admin/");

    // If this is login page (root index.html) bind UI
    const loginForm = document.getElementById("loginForm");
    if(loginForm){
      const roleInput = document.getElementById("role");
      const pills = document.querySelectorAll("#rolePills .pill");
      const emailEl = document.getElementById("email");
      const passEl = document.getElementById("password");
      const err = document.getElementById("loginError");

      function setRole(r){
        roleInput.value = r;
        pills.forEach(p => p.classList.toggle("active", p.dataset.role===r));
        // auto fill demo credentials
        if(r==="admin"){ emailEl.value="admin@app.com"; passEl.value="admin123"; }
        else { emailEl.value="user@app.com"; passEl.value="user123"; }
      }

      pills.forEach(p => p.addEventListener("click", ()=> setRole(p.dataset.role)));

      loginForm.addEventListener("submit", function(e){
        e.preventDefault();
        err.style.display = "none";
        const role = roleInput.value;
        const email = emailEl.value.trim();
        const password = passEl.value;
        const res = window.MaeledAuth.login(role, email, password);
        if(!res.ok){ err.style.display="block"; return; }

        // redirect based on role
        if(role==="admin") window.location.href = "admin/dashboard.html";
        else window.location.href = "home.html";
      });
      return;
    }

    // Guard pages by required role attribute if present
    const required = document.body?.getAttribute("data-required-role");
    if(required && required !== "public"){
      window.MaeledAuth.requireRole(required);
    }
  });
})();