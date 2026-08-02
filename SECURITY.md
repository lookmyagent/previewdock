# Security Policy

File parsers process attacker-controlled binary data. Treat every input as
untrusted.

## Reporting

Please do not disclose exploitable parser, sandbox-escape, cross-site scripting,
or resource-exhaustion issues in a public issue. Until a project security
contact is published, open a GitHub security advisory in the future repository.

## Required controls

- Never execute macros, embedded JavaScript, shell commands, or active content.
- Render HTML-like output only after sanitization.
- Run heavy or native-derived parsers in isolated workers.
- Apply file-size, memory, time, archive-entry, and expansion-ratio budgets.
- Revoke object URLs and terminate workers when a session closes.
- Do not upload files unless the host application explicitly opts in.

The current prototype is suitable for architecture evaluation, not production
processing of hostile files.
