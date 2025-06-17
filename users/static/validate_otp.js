document.addEventListener('DOMContentLoaded', function () {
    
    var form = document.querySelector('.needs-otp-validation');
    
    form.addEventListener('submit', function (event) {

        var otpField = document.getElementById('id_otp');

		if (otpField.value === "") {
            otpField.classList.add('is-invalid');
            otpField.nextElementSibling.innerHTML = 'Otp must be filled out.';
            event.preventDefault();
        }else if (otpField.value.length !== 6) {
			otpField.classList.add('is-invalid');
			otpField.nextElementSibling.innerHTML = 'Otp number must be 6 digits.';
			event.preventDefault();
		}
    });
});