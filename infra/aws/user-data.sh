#!/usr/bin/env bash
set -euo pipefail

dnf install -y nginx tar gzip awscli

install -d -m 0755 /opt/minutecryptic/releases
install -d -m 0755 /var/www/minutecryptic
install -d -m 0755 /opt/minutecryptic/releases/bootstrap

cat >/opt/minutecryptic/releases/bootstrap/index.html <<'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MinuteCryptic infrastructure</title>
  </head>
  <body>
    <main>
      <h1>MinuteCryptic infrastructure is ready</h1>
      <p>The application has not been deployed yet.</p>
    </main>
  </body>
</html>
EOF

printf 'ok\n' >/opt/minutecryptic/releases/bootstrap/health

ln -sfn /opt/minutecryptic/releases/bootstrap /var/www/minutecryptic/current.next
mv -Tf /var/www/minutecryptic/current.next /var/www/minutecryptic/current

cat >/etc/nginx/conf.d/minutecryptic.conf <<'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name minutecryptic.invalid;

    root /var/www/minutecryptic/current;
    index index.html;

    location = /health {
        default_type text/plain;
        try_files /health =503;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

rm -f /etc/nginx/conf.d/default.conf
nginx -t
systemctl enable nginx amazon-ssm-agent
systemctl restart nginx
systemctl restart amazon-ssm-agent
