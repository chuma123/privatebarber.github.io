// Sample user data
const users = {
  luvo: { password: "3430", haircuts: 4, used: 1, nextBooking: null },
  peter: { password: "6882", haircuts: 4, used: 4, nextBooking: null },
  lesego: {password: "5820", haircuts: 4, used: 1, nextBooking: null },
  mac: {password: "4692", haircuts: 4, used: 2, nextBooking: null},
  themba: {password: "9333", haircuts: 5, used: 0, nextBooking: null },
  daryl: {password: "6921", haircuts: 4, used: 1, nextBooking: null },
  mj: {password: "5434", haircuts: 8, used: 2, nextBooking: null},
     };

// Admin password
const adminPassword = "12314";

// Currently logged-in user
let loggedInUser = null;

// CHECK FOR EXISTING SESSION ON PAGE LOAD
document.addEventListener('DOMContentLoaded', function() {
  // Always start with login form visible
  switchView("login");
  
  // Clear any existing session data
  localStorage.removeItem("loggedInUser");
  loggedInUser = null;
  
  // Add enter key support for login
  addEnterKeySupport();
  
  // Clear any existing content from dashboards
  clearDashboardContent();
});

// LOGIN FUNCTION
function login() {
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  
  if (!usernameInput || !passwordInput) {
    alert("Login form not found");
    return;
  }
  
  const uname = usernameInput.value.toLowerCase().trim();
  const pword = passwordInput.value;

  if (!uname || !pword) {
    alert("Please enter both username and password");
    return;
  }

  if (uname === "admin" && pword === adminPassword) {
    loggedInUser = "admin";
    localStorage.setItem("loggedInUser", loggedInUser);
    // Initialize date picker and countdown for admin
    if (typeof flatpickr !== 'undefined') {
      initializeDatePicker();
    }
    startCountdown();
    switchView("admin");
    clearLoginForm();
  } else if (users[uname] && users[uname].password === pword) {
    loggedInUser = uname;
    localStorage.setItem("loggedInUser", loggedInUser);
    // Initialize date picker and countdown for user
    if (typeof flatpickr !== 'undefined') {
      initializeDatePicker();
    }
    startCountdown();
    switchView("user");
    clearLoginForm();
  } else {
    alert("Invalid login credentials");
  }
}

// LOGOUT FUNCTION
function logout() {
  loggedInUser = null;
  localStorage.removeItem("loggedInUser");
  clearLoginForm();
  clearDashboardContent();
  switchView("login");
}

// CLEAR LOGIN FORM
function clearLoginForm() {
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  
  if (usernameInput) usernameInput.value = "";
  if (passwordInput) passwordInput.value = "";
}

// SWITCH DASHBOARD VIEW
function switchView(view) {
  const loginForm = document.getElementById("login-form");
  const userDashboard = document.getElementById("user-dashboard");
  const adminDashboard = document.getElementById("admin-dashboard");

  // Hide all views
  if (loginForm) loginForm.classList.add("hidden");
  if (userDashboard) userDashboard.classList.add("hidden");
  if (adminDashboard) adminDashboard.classList.add("hidden");

  // Show the requested view
  if (view === "user" && userDashboard) {
    userDashboard.classList.remove("hidden");
    showUserDashboard(loggedInUser);
  } else if (view === "admin" && adminDashboard) {
    adminDashboard.classList.remove("hidden");
    showAdminDashboard();
  } else if (loginForm) {
    loginForm.classList.remove("hidden");
  }
}

// SHOW USER DASHBOARD
function showUserDashboard(username) {
  if (!users[username]) return;
  
  const user = users[username];
  const remaining = user.haircuts - user.used;

  const userNameEl = document.getElementById("user-name");
  const remainingCutsEl = document.getElementById("remaining-cuts");
  const nextDateEl = document.getElementById("next-date");
  const datePickerEl = document.getElementById("datepicker");

  if (userNameEl) userNameEl.innerText = username;
  if (remainingCutsEl) remainingCutsEl.innerText = remaining;
  if (nextDateEl) nextDateEl.innerText = user.nextBooking || "None";
  if (datePickerEl) datePickerEl.classList.add("hidden");
}

// SHOW ADMIN DASHBOARD
function showAdminDashboard() {
  const userList = document.getElementById("user-list");
  const bookingsList = document.getElementById("admin-bookings");
  
  if (userList) {
    const userListHTML = "<h4>Users:</h4><ul>" + 
      Object.keys(users).map(user => {
        const u = users[user];
        const remaining = u.haircuts - u.used;
        return "<li><strong>" + user + "</strong> - " + remaining + "/" + u.haircuts + " cuts remaining, Next: " + (u.nextBooking || 'None') + "</li>";
      }).join('') + "</ul>";
    
    userList.innerHTML = userListHTML;
  }
  
  if (bookingsList) {
    const allBookings = Object.keys(users)
      .filter(user => users[user].nextBooking)
      .map(user => ({
        user: user,
        date: users[user].nextBooking
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const bookingsHTML = "<h4>Upcoming Bookings:</h4>" +
      (allBookings.length > 0 
        ? "<ul>" + allBookings.map(booking => 
            "<li>" + booking.user + " - " + booking.date + "</li>"
          ).join('') + "</ul>"
        : "<p>No upcoming bookings</p>");
    
    bookingsList.innerHTML = bookingsHTML;
  }
}

// DATE PICKER FUNCTIONALITY
function openDatePicker() {
  const datePicker = document.getElementById("datepicker");
  if (datePicker) {
    datePicker.classList.remove("hidden");
    datePicker.focus();
  }
}

function initializeDatePicker() {
  const datePickerEl = document.getElementById("datepicker");
  if (datePickerEl && typeof flatpickr !== 'undefined') {
    flatpickr("#datepicker", {
      minDate: "today",
      dateFormat: "Y-m-d",
      onChange: function(selectedDates, dateStr, instance) {
        if (dateStr && loggedInUser && users[loggedInUser]) {
          users[loggedInUser].nextBooking = dateStr;
          const nextDateEl = document.getElementById("next-date");
          if (nextDateEl) nextDateEl.innerText = dateStr;
          
          const datePickerEl = document.getElementById("datepicker");
          if (datePickerEl) datePickerEl.classList.add("hidden");
          
          alert("Booking confirmed for " + dateStr);
        }
      }
    });
  }
}

// COUNTDOWN TIMER
function startCountdown() {
  function updateCountdown() {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const timeLeft = nextMonth - now;
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    const countdownElement = document.getElementById("reset-countdown");
    if (countdownElement) {
      countdownElement.innerText = "Resets in: " + days + "d " + hours + "h " + minutes + "m";
    }
  }
  
  // Update immediately and then every minute
  updateCountdown();
  setInterval(updateCountdown, 60000);
}

// ENTER KEY SUPPORT FOR LOGIN
function addEnterKeySupport() {
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  
  if (usernameInput) {
    usernameInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        login();
      }
    });
  }
  
  if (passwordInput) {
    passwordInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        login();
      }
    });
  }
}
  
  if (passwordInput) {
    passwordInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        login();
      }
    });
  }



