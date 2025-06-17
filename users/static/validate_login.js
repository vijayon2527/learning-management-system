document.addEventListener('DOMContentLoaded', function () {
    var form = document.querySelector('.needs-validation'); // Change class name as necessary

    form.addEventListener('submit', function (event) {
        // Prevent default submission
        event.preventDefault();

        // Get the input fields
        var usernameField = document.getElementById("id_username");
        var passwordField = document.getElementById("id_password");

        // Clear previous error messages
        var errorMessages = document.querySelectorAll(".invalid-feedback");
        errorMessages.forEach(function (error) {
            error.remove();
        });
        var invalidFields = document.querySelectorAll(".is-invalid");
        invalidFields.forEach(function (field) {
            field.classList.remove("is-invalid");
        });

        // Initialize a flag to track if the form is valid
        var isValid = true;

        // Validation logic for Mobile Number
        if (!usernameField.value) {
            usernameField.classList.add("is-invalid");
            usernameField.insertAdjacentHTML('afterend', '<div class="invalid-feedback">Please enter your mobile number</div>');
            isValid = false;
        } else if (!/^\d{10}$/.test(usernameField.value)) {
            usernameField.classList.add("is-invalid");
            usernameField.insertAdjacentHTML('afterend', '<div class="invalid-feedback">Mobile number must be exactly 10 digits</div>');
            isValid = false;
        }

        // Validation logic for Password
        if (!passwordField.value) {
            passwordField.classList.add("is-invalid");
            passwordField.insertAdjacentHTML('afterend', '<div class="invalid-feedback">Please provide a password</div>');
            isValid = false;
        }

        // If the form is valid, submit the form
        if (isValid) {
            form.submit();
        }
    });
});
