import sendgrid
from django.conf import settings
from django.template import loader
from sendgrid.helpers.mail import To, Email, Content, Mail

from fmm.utils.constants.template_names import DEFAULT_MAIL_TEMPLATE


class MailSender:
    def __init__(self):
        self.sg = sendgrid.SendGridAPIClient(api_key=settings.SENDGRID_API_KEY)

    def send(self, to_email: str, subject: str, content: str):
        from_email = Email(settings.SENDGRID_EMAIL_FROM)

        context = {
            'body_content': content,
            'subject': subject,
        }

        rendered = loader.render_to_string(DEFAULT_MAIL_TEMPLATE, context)

        to_email = To(to_email)
        subject = subject
        content = Content("text/html", rendered)
        mail = Mail(from_email, to_email, subject, content)

        return self.sg.client.mail.send.post(request_body=mail.get())
