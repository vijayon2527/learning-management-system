document.addEventListener('DOMContentLoaded', function () {
    var form = document.querySelector('.needs-validation'); // Change class name as necessary

    form.addEventListener('submit', function (event) {
        // Prevent default submission
        event.preventDefault();

        // Get the input fields
        var contactField = document.getElementById("id_mobile");
        var password1Field = document.getElementById("id_password1");
        var password2Field = document.getElementById("id_password2");
        var firstNameField = document.getElementById("id_first_name");
        var lastNameField = document.getElementById("id_last_name");
        var dobField = document.getElementById("id_date_of_birth");
        var address1Field = document.getElementById("id_address_line_1");
        var cityField = document.getElementById("id_city");
        var stateField = document.getElementById("id_state");
        var postalCodeField = document.getElementById("id_postal_code");
        var resumeField = document.getElementById("id_resume");

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

        if (!contactField.value) {
            contactField.classList.add("is-invalid");
            contactField.insertAdjacentHTML('afterend', '<div class="invalid-feedback">Please enter your mobile number</div>');
            isValid = false;
        } else if (!/^\d{10}$/.test(contactField.value)) {
            contactField.classList.add("is-invalid");
            contactField.insertAdjacentHTML('afterend', '<div class="invalid-feedback">Mobile number must be exactly 10 digits</div>');
            isValid = false;
        }

        if (!firstNameField.value) {
            firstNameField.classList.add("is-invalid");
            firstNameField.insertAdjacentHTML('afterend', '<div class="invalid-feedback">Please enter your first name</div>');
            isValid = false;
        }

        if (!lastNameField.value) {
            lastNameField.classList.add("is-invalid");
            lastNameField.insertAdjacentHTML('afterend', '<div class="invalid-feedback">Please enter your last name</div>');
            isValid = false;
        }

        if (!dobField.value) {
            dobField.classList.add("is-invalid");
            dobField.insertAdjacentHTML('afterend', '<div class="invalid-feedback">Please enter your date of birth</div>');
            isValid = false;
        }

        if (!address1Field.value) {
            address1Field.classList.add("is-invalid");
            address1Field.insertAdjacentHTML('afterend', '<div class="invalid-feedback">Please enter your address line 2</div>');
            isValid = false;
        }

        if (!cityField.value) {
            cityField.classList.add("is-invalid");
            cityField.insertAdjacentHTML('afterend', '<div class="invalid-feedback">Please enter your city</div>');
            isValid = false;
        }

        if (!stateField.value) {
            stateField.classList.add("is-invalid");
            stateField.insertAdjacentHTML('afterend', '<div class="invalid-feedback">Please enter your state</div>');
            isValid = false;
        }

        if (!postalCodeField.value) {
            postalCodeField.classList.add("is-invalid");
            postalCodeField.insertAdjacentHTML('afterend', '<div class="invalid-feedback">Please enter your postal code</div>');
            isValid = false;
        } else if (postalCodeField.value.length !== 6) {
            postalCodeField.classList.add("is-invalid");
            postalCodeField.insertAdjacentHTML('afterend', '<div class="invalid-feedback">Postal code must be exactly 6 digits</div>');
            isValid = false;
        }

        if (!resumeField.value) {
            resumeField.classList.add("is-invalid");
            resumeField.insertAdjacentHTML('afterend', '<div class="invalid-feedback">Please upload your resume</div>');
            isValid = false;
        }

        if (!password1Field.value) {
            password1Field.classList.add("is-invalid");
            password1Field.insertAdjacentHTML('afterend', '<div class="invalid-feedback">Please provide a password</div>');
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
