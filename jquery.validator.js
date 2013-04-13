/*	jquery-validator.js
	A jQuery Plugin for moar awesome form validation and messaging
	Author: Brennan Novak, hi@brennannovak.com
	License: http://unlicense.org/ (i.e. do what you want with it!)
	Code: https://github.com/brennannovak/jquery-validator.js
	Settings:
	- element	: Array of elements, contains: selector, rule, field, action (label, border, element)
	- styles	: Styles for labels and input fields
	- message	: Is appended to the start of invalid elements 'Please enter a _________'
*/
(function($)
{
	$.validator = function(options) {

		var defaults = {
			elements	: [],
			styles		: { valid : 'form_valid', error : 'form_error' },
			message		: '',
			success		: function(){},
			failed		: function(){}
		};

		var settings		= $.extend(defaults, options);
		var valid_count		= 0;
		var element_count	= settings.elements.length;
		var error_messages	= '';

		// Validate Rules
		function validateRequire(value) {
			if (value !== '') { return true; }
			else { return false; }
		}

		function validateInteger(value) {
			if (value > 0) { return true; }
			return false;
		}

		function validateConfirm(source_value, confirm_selector) {
			var confirm_source	= confirm_selector.replace('_confirm', '');
			var confirm_value	= $(confirm_source).val();
			var confirm_state	= false;

			if (source_value === confirm_value && source_value !== '') { confirm_state = true; }
			else { confirm_state = false; }

			return confirm_state;
		}

		function validateEmailAddress(email) {
			var email_pattern = new RegExp(/^(("[\w-\s]+")|([\w- ]+(?:\.[\w- ]+)*)|("[\w-\s]+")([\w- ]+(?:\.[\w- ]+)*))(@((?:[\w- ]+\.)*\w[\w- ]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
			return email_pattern.test(email);
		}

		function validateUsPhoneNumber(phone_number) {
			var phone_number_pattern = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
			return phone_number_pattern.test(phone_number);
		}

		function validateCreditCard(creditcard) {
			if (getCreditCardTypeByNumber(creditcard) === '?') { return false; }
			else { return true; }
		}

		// Credit Card
		function getCreditCardTypeByNumber(ccnumber) {
			var cc = (ccnumber + '').replace(/\s/g, ''); //remove space

			if ((/^(34|37)/).test(cc) && cc.length === 15) {
				return 'AMEX';
			} else if ((/^(51|52|53|54|55)/).test(cc) && cc.length === 16) {
				return 'MasterCard';
			} else if ((/^(4)/).test(cc) && (cc.length === 13 || cc.length === 16)) {
				return 'Visa';
			} else if ((/^(300|301|302|303|304|305|36|38)/).test(cc) && cc.length === 14) {
				return 'DinersClub';
			} else if ((/^(2014|2149)/).test(cc) && cc.length === 15) {
				return 'enRoute';
			} else if ((/^(6011)/).test(cc) && cc.length === 16) {
				return 'Discover';
			} else if ((/^(3)/).test(cc) && cc.length === 16) {
				return 'JCB';
			} else if ((/^(2131|1800)/).test(cc) && cc.length === 15) {
				return 'JCB';
			}

			return '?';
		}

		// Message Types
		function messageLabel(valid, element) {

			var selector_error = element.selector + '_error';

			// Element has label message
			if (valid && $(selector_error).length !== 0) {

				$(element.selector + '_error').html('').removeClass(settings.styles.error).addClass(settings.styles.valid);
				$(element.selector + '_error').delay(300, function() { $(this).fadeOut(); });
			}
			else {

				// Label exists
				if ($(selector_error).length !== 0) {
					$(selector_error).html(settings.message + ' ' + element.field).removeClass(settings.styles.valid).addClass(settings.styles.error);
					$(element.selector + '_error').delay(150, function() { $(this).fadeIn(); });
				}
			}
		}

		function messageBorder(valid, element) {

			if (!valid && $(element.selector).length !== 0) {

				$(element.selector).css('border', '1px solid red');
			}
		}

		function messageElement(valid, element) {

			if (!valid && $(element.selector).length !== 0) {

				$(element.selector).val(element.field).addClass(settings.styles.error);
				$(element.selector).delay(1000, function() {
					$(element.selector).val('').removeClass(settings.styles.error);
				});
			}
		}

		function messageNone() {
			return false;
		}

		// Loops through 'elements' and runs values
		$.each(settings.elements, function(index, element) {

			var validate = $(element.selector).val();
			var is_valid = false;

			// Validate By Rule
			if (element.rule === 'require') {
				is_valid = validateRequire(validate);
			}
			else if (element.rule === 'require_integer') {
				is_valid = validateInteger(validate);
			}
			else if (element.rule === 'email') {
				is_valid = validateEmailAddress(validate);
			}
			else if (element.rule === 'us_phone') {
				is_valid = validateUsPhoneNumber(validate);
			}
			else if (element.rule === 'confirm') {
				is_valid = validateConfirm(validate, element.selector);
			}
			else if (element.rule === 'credit_card') {
				is_valid = validateCreditCard(validate);
			}
			else if (jQuery.isFunction(element.rule)) {
				is_valid = element.rule(element.selector);
			}
			else {
				is_valid = false;
			}

			// Element Action
			if (element.action === 'label') {
				messageLabel(is_valid, element);
			}
			else if (element.action === 'border') {
				messageBorder(is_valid, element);
			}
			else if (element.action === 'element') {
				messageElement(is_valid, element);
			}
			else {
				messageNone();
			}

			// Valid Count
			if (!is_valid) {
				error_messages += ' ' + element.field + ',';
			}
			else {
				valid_count++;
			}
		});

		// Fire Success / Error Callback
		if (valid_count === element_count) {
			settings.success();
		}
		else {
			var error_output = error_messages.substring(0, error_messages.length - 1);
			settings.failed(error_output);
		}
	};
})($);