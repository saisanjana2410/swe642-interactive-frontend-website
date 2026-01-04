// Sai Sanjana Kambalapally

// ------------------ Cookie Functions ------------------
// Set a cookie
function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + days*24*60*60*1000);
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

// Get a cookie
function getCookie(name) {
    const cname = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(cname) === 0) return c.substring(cname.length, c.length);
    }
    return "";
}

// Show greeting
function showGreeting() {
    let username = getCookie("username");

    if (username !== "") {
        const hour = new Date().getHours();
        let greetingText = "Good Morning";
        if (hour >= 12 && hour < 18) greetingText = "Good Afternoon";
        else if (hour >= 18) greetingText = "Good Evening";

        document.getElementById("greeting").innerHTML =
            `${greetingText} ${username}, welcome to SWE642 Survey! 
            <a href="#" onclick="changeName()">[Change Name]</a>`;
    } else {
        let name = prompt("Welcome! Please enter your name:");
        if (name != null && name.trim() !== "") {
            setCookie("username", name.trim(), 7);
            location.reload();
        }
    }
}

// Change name
function changeName() {
    let name = prompt("Enter your name:");
    if (name != null && name.trim() !== "") {
        setCookie("username", name.trim(), 7);
        location.reload();
    }
}

// ------------------ Average and Maximum ------------------
function calculateAverageMax() {
    const dataField = document.getElementById("dataInput").value.trim();
    if (!dataField) return;

    const numbers = dataField.split(',').map(num => parseInt(num.trim()));

    // Validation: must have 10 numbers, all between 1 and 100
    if (numbers.length !== 10 || numbers.some(n => isNaN(n) || n < 1 || n > 100)) {
        alert("Please enter exactly 10 numbers, each between 1 and 100, separated by commas.");
        document.getElementById("dataInput").value = "";
        document.getElementById("average").value = "";
        document.getElementById("maximum").value = "";
        return;
    }

    const sum = numbers.reduce((a, b) => a + b, 0);
    const avg = (sum / numbers.length).toFixed(2);
    const max = Math.max(...numbers);

    document.getElementById("average").value = avg;
    document.getElementById("maximum").value = max;
}

// ------------------ Zip Lookup ------------------
function lookupZip() {
    const zipInput = document.getElementById("zip");
    const zip = zipInput.value.trim();
    const citySpan = document.getElementById("city");
    const stateSpan = document.getElementById("state");
    const zipError = document.getElementById("zipError");

    // Clear previous
    zipError.textContent = "";
    citySpan.textContent = "";
    stateSpan.textContent = "";

    if (!zip) return;

    // Ajax request
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "zipcodes.json", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    const entry = data.zipcodes.find(item => item.zip === zip);

                    if (entry) {
                        citySpan.textContent = entry.city;
                        stateSpan.textContent = entry.state;
                    } else {
                        zipError.textContent = "Invalid ZIP code.";
                    }
                } catch (err) {
                    console.error("Error parsing JSON:", err);
                    zipError.textContent = "Error loading ZIP data.";
                }
            } else {
                zipError.textContent = "Could not connect to server.";
            }
        }
    };
    xhr.send();
}

// ------------------ Form Validation ------------------
function validateFormOnClick() {
    const errors = [];
    const toClear = new Set();

    // ---------- Required Fields ----------
    const requiredFields = [
        {id: "username", name: "Full Name"},
        {id: "email", name: "Email"},
        {id: "surveyDate", name: "Date of Survey"},
        {id: "recommend", name: "Likelihood of Recommending"},
    ];

    requiredFields.forEach(field => {
        const elem = document.getElementById(field.id);
        if (elem && elem.value.trim() === "") {
            errors.push(`${field.name} is required.`);
            toClear.add(field.id);
        }
    });

    // ---------- Name Format ----------
    const nameElem = document.getElementById("username");
    if (nameElem) {
        const name = nameElem.value.trim();
        if (name && !/^[A-Za-z\s]+$/.test(name)) {
            errors.push("Name must contain only alphabets.");
            toClear.add("username");
        }
    }

    // ---------- Email Format ----------
    const emailElem = document.getElementById("email");
    if (emailElem) {
        const email = emailElem.value.trim();
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push("Please enter a valid email address.");
            toClear.add("email");
        }
    }

    // ---------- Address & Phone Validation ----------
    const addressFields = [
        {id: "address", pattern: new RegExp("^[A-Za-z0-9\\s\\.,#\\-/]*$"), name: "Street Address"},
        {id: "phone", pattern: new RegExp("^\\d{3}[- ]?\\d{3}[- ]?\\d{4}$"), name: "Phone"}
    ];

    addressFields.forEach(f => {
        const elem = document.getElementById(f.id);
        if (elem) {
            const val = elem.value.trim();
            if (val && !f.pattern.test(val)) {
                errors.push(`${f.name} is invalid.`);
                toClear.add(f.id);
            }
        }
    });

    // ---------- Data Input ----------
    const dataField = document.getElementById("dataInput");
    if (dataField) {
        const data = dataField.value.trim();
        if (data) {
            const nums = data.split(",").map(n => n.trim());
            if (nums.length !== 10 || nums.some(n => isNaN(n))) {
                errors.push("Data Input must contain exactly 10 numbers, comma-separated.");
                toClear.add("dataInput");
            }
        }
    }

    // ---------- Checkbox Group: At least 2 ----------
    const checkedLikes = document.querySelectorAll('input[name="likes"]:checked').length;
    if (checkedLikes < 2) {
        errors.push("Please select at least two options in 'What did you like most about the campus?'");
        document.querySelectorAll('input[name="likes"]').forEach(cb => cb.checked = false);
    }

    // ---------- Radio Group: Exactly 1 ----------
    if (!document.querySelector('input[name="interest"]:checked')) {
        errors.push("Please select how you became interested in the university.");
    }

    // ---------- Show Errors ----------
    if (errors.length > 0) {
        let msg = "Please fix the following errors:\n\n";
        errors.forEach((err, i) => msg += `${i + 1}. ${err}\n`);
        alert(msg);

        // Clear only fields with errors
        toClear.forEach(id => {
            const elem = document.getElementById(id);
            if (elem) elem.value = "";
        });
        return false;
    }

    alert("Survey submitted successfully!");
    return true;
}

// ------------------ Reset Form ------------------
function resetForm() {
    const form = document.querySelector("form");
    form.reset();

    document.getElementById("city").textContent = "";
    document.getElementById("state").textContent = "";
    document.getElementById("zipError").textContent = "";

    document.getElementById("city").classList.remove("text-danger");
    document.getElementById("state").classList.remove("text-danger");
}

// ------------------ DOM Ready ------------------
window.addEventListener("DOMContentLoaded", () => {
    showGreeting();
    document.getElementById("dataInput").addEventListener("blur", calculateAverageMax);
});
