#!/usr/bin/env bash
set -euo pipefail

if [[ "$#" -ne 3 ]]; then
  echo "usage: remote-deploy.sh <archive> <release-id> <sha256>" >&2
  exit 64
fi

archive="$1"
release_id="$2"
expected_hash="$3"

if [[ ! "$release_id" =~ ^[A-Za-z0-9._-]+$ ]]; then
  echo "Invalid release id." >&2
  exit 65
fi

if [[ ! "$expected_hash" =~ ^[a-f0-9]{64}$ ]]; then
  echo "Invalid SHA-256 value." >&2
  exit 65
fi

actual_hash="$(sha256sum "$archive" | awk '{print $1}')"
if [[ "$actual_hash" != "$expected_hash" ]]; then
  echo "Release archive SHA-256 mismatch." >&2
  exit 66
fi

while IFS= read -r entry; do
  case "$entry" in
    /*|../*|*/../*|*/..)
      echo "Release archive contains an unsafe path: $entry" >&2
      exit 67
      ;;
  esac
done < <(tar -tzf "$archive")

releases_root="/opt/minutecryptic/releases"
release_path="${releases_root}/${release_id}"
staging_path="${release_path}.staging"

rm -rf "$staging_path"
install -d -m 0755 "$staging_path"
tar -xzf "$archive" -C "$staging_path"

if [[ ! -f "$staging_path/dist/index.html" ]]; then
  echo "Release archive does not contain dist/index.html." >&2
  rm -rf "$staging_path"
  exit 68
fi

if ! grep -q '<div id="root"></div>' "$staging_path/dist/index.html"; then
  echo "Release index does not contain the application root." >&2
  rm -rf "$staging_path"
  exit 68
fi

printf 'ok\n' >"$staging_path/dist/health"
find "$staging_path/dist" -type d -exec chmod 0755 {} +
find "$staging_path/dist" -type f -exec chmod 0644 {} +

if [[ -e "$release_path" ]]; then
  rm -rf "$release_path"
fi
mv "$staging_path/dist" "$release_path"
rm -rf "$staging_path"

nginx -t 2>&1
ln -sfn "$release_path" /var/www/minutecryptic/current.next
mv -Tf /var/www/minutecryptic/current.next /var/www/minutecryptic/current
systemctl reload nginx

if [[ "$(curl --fail --silent http://127.0.0.1/health)" != "ok" ]]; then
  echo "Deployed release failed its local health check." >&2
  exit 69
fi

find "$releases_root" -mindepth 1 -maxdepth 1 -type d ! -path "$release_path" -exec rm -rf {} +

echo "Activated MinuteCryptic release $release_id."
