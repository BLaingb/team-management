import phonenumbers
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


class PhoneNumberValidator:
    def __call__(self, value: str):
        if not value:
            return
        try:
            phone_number = phonenumbers.parse(value)

            if not phonenumbers.is_valid_number(phone_number):
                raise ValidationError(
                    _("%(value)s is not a valid phone number."),
                    params={"value": value},
                )

            if not phonenumbers.is_possible_number(phone_number):
                raise ValidationError(
                    _("%(value)s is not a possible phone number."),
                    params={"value": value},
                )

        except phonenumbers.NumberParseException as e:
            raise ValidationError(
                _("%(value)s is not a valid phone number: %(error)s"),
                params={"value": value, "error": str(e)},
            )
