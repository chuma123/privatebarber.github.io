// ==== CONFIG ====
const users = {
  luvo: { password: "3430", haircuts: 4, used: 2, nextBooking: null },
  peter: { password: "6882", haircuts: 4, used: 2, nextBooking: null },
  lesego: { password: "5820", haircuts: 4, used: 2, nextBooking: null },
  mac: { password: "4692", haircuts: 4, used: 1, nextBooking: null },
  themba: { password: "9333", haircuts: 5, used: 0, nextBooking: null },
  daryl: { password: "6921", haircuts: 4, used: 1, nextBooking: null },
  mj: { password: "5434", haircuts: 8, used: 4, nextBooking: null },
  kiid: {password: "1385", haircuts: 4,used: 2, nextBooking: null },
};
const adminPassword = "12314";

// ==== STATE ====
let loggedInUser = null;
let pickerInstance = null;

// ==== INITIALIZATION ====
document.addEventListener("DOMContentLoaded", () => {
  emailjs.init("vUTSYPKhBVAZIVaJc"); // Your actual EmailJS public key here

  switchView("login");
  localStorage.removeItem("loggedInUser");
  loggedInUser = null;

  addEnterKeySupport();
  clearDashboardContent();

  // Contact form submit handler (if you have a contact form with id="contact-form")
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      sendEmail();
      this.reset();
    });
  }
});

// ==== LOGIN / LOGOUT ====
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
    startCountdown();
    switchView("admin");
    clearLoginForm();
  } else if (users[uname] && users[uname].password === pword) {
    loggedInUser = uname;
    localStorage.setItem("loggedInUser", loggedInUser);

    // Restore stored booking from localStorage
    const savedBooking = localStorage.getItem(`booking_${uname}`);
    if (savedBooking) {
      users[uname].nextBooking = savedBooking;
    }

    startCountdown();
    switchView("user");
    clearLoginForm();
  } else {
    alert("Invalid login credentials");
  }
}

function logout() {
  loggedInUser = null;
  localStorage.removeItem("loggedInUser");
  clearLoginForm();
  clearDashboardContent();
  switchView("login");
}

function clearLoginForm() {
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  if (usernameInput) usernameInput.value = "";
  if (passwordInput) passwordInput.value = "";
}

// ==== VIEW SWITCHING ====
function switchView(view) {
  const loginForm = document.getElementById("login-form");
  const userDashboard = document.getElementById("user-dashboard");
  const adminDashboard = document.getElementById("admin-dashboard");

  if (loginForm) loginForm.classList.add("hidden");
  if (userDashboard) userDashboard.classList.add("hidden");
  if (adminDashboard) adminDashboard.classList.add("hidden");

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

// ==== DASHBOARDS ====
function showUserDashboard(username) {
  if (!users[username]) return;

  const user = users[username];
  const remaining = user.haircuts - user.used;

  document.getElementById("user-name").innerText = username;
  document.getElementById("remaining-cuts").innerText = remaining;

  if (user.nextBooking) {
    document.getElementById("next-date").innerText = user.nextBooking;
  } else {
    document.getElementById("next-date").innerText = "None";
  }

  // Hide the datepicker initially
  const datePickerEl = document.getElementById("datepicker");
  if (datePickerEl) datePickerEl.classList.add("hidden");
}

function showAdminDashboard() {
  const userList = document.getElementById("user-list");
  const bookingsList = document.getElementById("admin-bookings");

  if (userList) {
    const userListHTML =
      "<h4>Users:</h4><ul>" +
      Object.keys(users)
        .map((user) => {
          const u = users[user];
          const remaining = u.haircuts - u.used;
          return `<li><strong>${user}</strong> - ${remaining}/${u.haircuts} cuts remaining, Next: ${
            u.nextBooking || "None"
          }</li>`;
        })
        .join("") +
      "</ul>";
    userList.innerHTML = userListHTML;
  }

  if (bookingsList) {
    const allBookings = Object.keys(users)
      .filter((user) => users[user].nextBooking)
      .map((user) => ({ user: user, date: users[user].nextBooking }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const bookingsHTML =
      "<h4>Upcoming Bookings:</h4>" +
      (allBookings.length > 0
        ? "<ul>" +
          allBookings
            .map((booking) => `<li>${booking.user} - ${booking.date}</li>`)
            .join("") +
          "</ul>"
        : "<p>No upcoming bookings</p>");
    bookingsList.innerHTML = bookingsHTML;
  }
}

// ==== DATE PICKER & BOOKING ====
function openDatePicker() {
  const datePickerEl = document.getElementById("datepicker");
  if (!datePickerEl) return;

  datePickerEl.classList.remove("hidden");
  datePickerEl.focus();

  if (pickerInstance) {
    pickerInstance.destroy();
  }

  pickerInstance = flatpickr("#datepicker", {
    minDate: "today",
    dateFormat: "Y-m-d",
    onChange: function (selectedDates, dateStr) {
      if (dateStr && loggedInUser && users[loggedInUser]) {
        users[loggedInUser].nextBooking = dateStr;
        localStorage.setItem(`booking_${loggedInUser}`, dateStr);
        document.getElementById("next-date").innerText = dateStr;
        alert("Booking confirmed for " + dateStr);

        datePickerEl.classList.add("hidden");

        sendBookingEmail(loggedInUser, dateStr);
      }
    },
  });
}

// ==== EMAIL FUNCTIONS ====
function sendBookingEmail(user, date) {
  const emailParams = {
    user_name: user,
    booking_date: date,
    to_email: "admin@elvisdesigns.co.za", // adjust if needed
  };

  emailjs
    .send("service_y1pz564", "template_g96im7o", emailParams)
    .then(() => {
      alert("✅ Booking email sent!");
    })
    .catch((error) => {
      alert("❌ Failed to send booking email. Check console.");
      console.error("EmailJS error:", error);
    });
}

function sendEmail() {
  const nameInput = document.querySelector('input[name="user_name"]');
  const emailInput = document.querySelector('input[name="user_email"]');
  const messageInput = document.querySelector('textarea[name="message"]');

  if (!nameInput || !emailInput || !messageInput) {
    alert("Contact form inputs missing");
    return;
  }

  const templateParams = {
    user_name: nameInput.value,
    user_email: emailInput.value,
    message: messageInput.value,
  };

  emailjs
    .send("service_y1pz564", "template_g96im7o", templateParams)
    .then(() => {
      alert("✅ Email sent successfully!");
    })
    .catch((error) => {
      alert("❌ Failed to send email. Check console.");
      console.error("EmailJS error:", error);
    });
}

// ==== COUNTDOWN ====
function startCountdown() {
  function updateCountdown() {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const timeLeft = nextMonth - now;

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    const countdownElement = document.getElementById("reset-countdown");
    if (countdownElement) {
      countdownElement.innerText =
        "Resets in: " + days + "d " + hours + "h " + minutes + "m";
    }
  }

  updateCountdown();
  setInterval(updateCountdown, 60000);
}

// ==== UTILS ====
function addEnterKeySupport() {
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");

  if (usernameInput) {
    usernameInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") login();
    });
  }
  if (passwordInput) {
    passwordInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") login();
    });
  }
}

function clearDashboardContent() {
  const userList = document.getElementById("user-list");
  const bookingsList = document.getElementById("admin-bookings");

  if (userList) userList.innerHTML = "";
  if (bookingsList) bookingsList.innerHTML = "";
}
// ==== GALLERY DOUBLE-TAP ZOOM ====
document.addEventListener("DOMContentLoaded", function () {
  let lastTap = 0;

  document.querySelectorAll('.gallery-item img').forEach(img => {
    img.addEventListener('touchend', function () {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;

      if (tapLength < 300 && tapLength > 0) {
        this.classList.toggle('zoomed');
      }

      lastTap = currentTime;
    });

    img.addEventListener('touchstart', function () {
      document.querySelectorAll('.gallery-item img').forEach(otherImg => {
        if (otherImg !== this) {
          otherImg.classList.remove('zoomed');
        }
      });
    });
  });
});
