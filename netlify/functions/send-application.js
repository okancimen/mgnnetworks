exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request' }) };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Email service not configured' }) };
  }

  const {
    first_name, last_name, student_email, parent_email,
    birthday, country, school, grade,
    department, programme, start_month, motivation, referral,
  } = data;

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  const teamEmailBody = `New Fellowship Application
──────────────────────────

APPLICANT
Name:       ${first_name} ${last_name}
DOB:        ${birthday}
Country:    ${country}
School:     ${school}
Grade/Year: ${grade}

CONTACT
Student:    ${student_email}
Parent:     ${parent_email}

FELLOWSHIP
Department: ${department}
Programme:  ${programme}
Start:      ${start_month}
Referral:   ${referral || '—'}

MOTIVATION
──────────────────────────
${motivation}
──────────────────────────

Reply to this email to contact the student directly.
Magenta Networks · mgnnetworks.com`;

  const studentEmailBody = `Dear ${first_name},

Thank you for applying to the Magenta Networks Global Career Fellowship.

We have received your application for the ${programme}, starting ${start_month}.

What happens next:

  1. We review every application personally — this takes up to 5 business days.
  2. If your application meets our criteria, we will be in touch to discuss
     next steps, including the Eduentry psychometric assessment.
  3. Fewer than 30% of applicants are accepted. We will communicate our
     decision either way.

In the meantime, if you have any questions, reply to this email or write
to us at info@mgnnetworks.com.

Yours sincerely,

Okan Cimen
Managing Director
Magenta Networks Pte Ltd
Singapore · mgnnetworks.com`;

  try {
    const r1 = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        from: 'Magenta Networks <applications@mgnnetworks.com>',
        to: ['c.o@mgnnetworks.com'],
        reply_to: student_email,
        subject: `New Application — ${first_name} ${last_name} (${programme})`,
        text: teamEmailBody,
      }),
    });
    if (!r1.ok) throw new Error(`Team notification failed: ${await r1.text()}`);

    const r2 = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        from: 'Magenta Networks <applications@mgnnetworks.com>',
        to: [student_email],
        cc: parent_email || undefined,
        reply_to: 'info@mgnnetworks.com',
        subject: 'Your application to the Global Career Fellowship — Magenta Networks',
        text: studentEmailBody,
      }),
    });
    if (!r2.ok) throw new Error(`Auto-reply failed: ${await r2.text()}`);

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error('Send error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
