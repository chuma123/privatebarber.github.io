const users = {
  admin: { password: "12314", isAdmin: true },
  client1: { password: "pass1", total: 4, used: 1 },
  client2: { password: "pass2", total: 8, used: 3 },
  client3: { password: "pass3", total: 4, used: 0 }
};

let currentUser = null;

function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorEl = document.getElementById("login-error");

  if (users[username] && users[username].password === password) {
    currentUser = username;
    document.getElementById("login-section").classList.add("hidden");

    if (users[username].isAdmin) {
      showAdminDashboard();
    } else {
      showUserDashboard();
    }
  } else {
    errorEl.textContent = "Invalid username or password.";
  }
}

function logout() {
  currentUser = null;
  document.getElementById("login-section").classList.remove("hidden");
  document.getElementById("user-dashboard").classList.add("hidden");
  document.getElementById("admin-dashboard").classList.add("hidden");
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  document.getElementById("login-error").textContent = "";
}

function showUserDashboard() {
  const user = users[currentUser];
  document.getElementById("user-name").textContent = currentUser;
  document.getElementById("used-cuts").textContent = user.used;
  document.getElementById("total-cuts").textContent = user.total;
  document.getElementById("user-dashboard").classList.remove("hidden");
}

function showAdminDashboard() {
  const userList = document.getElementById("user-list");
  userList.innerHTML = "";

  for (const username in users) {
    if (username === "admin") continue;
    const user = users[username];
    const div = document.createElement("div");
    div.className = "user-entry";
    div.innerHTML = `
      <strong>${username}</strong><br>
      Used: <input type="number" value="${user.used}" min="0" max="${user.total}" onchange="updateUsed('${username}', this.value)">
      / ${user.total}
    `;
    userList.appendChild(div);
  }

  document.getElementById("admin-dashboard").classList.remove("hidden");
}

function updateUsed(username, value) {
  const val = parseInt(value);
  if (!isNaN(val) && val >= 0 && val <= users[username].total) {
    users[username].used = val;
  }
}

