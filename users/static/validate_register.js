document.addEventListener('DOMContentLoaded', function () {
    var form = document.querySelector('.needs-validation'); // Change class name as necessary

    form.addEventListener('submit', function (event) {
        // Prevent default submission
        event.preventDefault();

        // Get the input fields
        var userTypeField = document.getElementById("id_user_type");
        var contactField = document.getElementById("id_contact");
        var password1Field = document.getElementById("id_password1");
        var password2Field = document.getElementById("id_password2");

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

        // Validation logic
        if (!userTypeField.value) {
            userTypeField.classList.add("is-invalid");
            userTypeField.insertAdjacentHTML('afterend', '<div class="invalid-feedback">Please select a user type</div>');
            isValid = false;
        }

        if (!contactField.value) {
            contactField.classList.add("is-invalid");
            contactField.insertAdjacentHTML('afterend', '<div class="invalid-feedback">Please enter your mobile number</div>');
            isValid = false;
        } else if (!/^\d{10}$/.test(contactField.value)) {
            contactField.classList.add("is-invalid");
            contactField.insertAdjacentHTML('afterend', '<div class="invalid-feedback">Mobile number must be exactly 10 digits</div>');
            isValid = false;
        }

        if (!password1Field.value) {
            password1Field.classList.add("is-invalid");
            password1Field.insertAdjacentHTML('afterend', '<div class="invalid-feedback">Please provide a password</div>');
            isValid = false;
        } else if (password1Field.value.length < 8) {
            password1Field.classList.add("is-invalid");
            password1Field.insertAdjacentHTML('afterend', '<div class="invalid-feedback">Password must be at least 8 characters long</div>');
            isValid = false;
        }

        if (!password2Field.value) {
            password2Field.classList.add("is-invalid");
            password2Field.insertAdjacentHTML('afterend', '<div class="invalid-feedback">Please confirm your password</div>');
            isValid = false;
        } else if (password2Field.value !== password1Field.value) {
            password2Field.classList.add("is-invalid");
            password2Field.insertAdjacentHTML('afterend', '<div class="invalid-feedback">Passwords do not match</div>');
            isValid = false;
        }

        // If the form is valid, submit the form
        if (isValid) {
            form.submit();
        }
    });
});
