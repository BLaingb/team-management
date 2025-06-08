from django.core.mail import EmailMultiAlternatives, get_connection
from django.conf import settings
import re
import logging


class EmailSender:
    def send_email(
        self, to: str | list[str], subject: str, body: str, plain_body: str = None
    ):
        # TODO: Queue email sending for background processing
        try:
            with get_connection(
                host=settings.RESEND_SMTP_HOST,
                port=settings.RESEND_SMTP_PORT,
                username=settings.RESEND_SMTP_USERNAME,
                password=settings.RESEND_SMTP_API_KEY,
                use_tls=True,
            ) as connection:
                recipients = to if isinstance(to, list) else [to]
                if not plain_body:
                    plain_body = re.sub("<[^<]+?>", "", body)
                email = EmailMultiAlternatives(
                    subject=subject,
                    body=plain_body,
                    from_email=settings.FROM_EMAIL,
                    to=recipients,
                    connection=connection,
                )
                email.attach_alternative(body, "text/html")
                email.send()
        except Exception as e:
            logging.exception("Failed to send email")
            return False
        return True


email_sender = EmailSender()
