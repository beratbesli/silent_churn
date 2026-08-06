# Security Policy

## Reporting a vulnerability

Do not publish API keys, customer data or exploit details in a public issue. Use GitHub's private security advisory feature for this repository and include a minimal reproduction and affected commit.

## Handling sensitive data

- Keep provider keys in `.env` or the in-memory application session only.
- Never commit `.env`, database files, exports or production customer data.
- The bundled sample data is synthetic and intended for demos only.
