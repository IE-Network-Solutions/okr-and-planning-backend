#!/bin/bash
set -e

export VAULT_ADDR=$VAULT_ADDR

# Authenticate to Vault
VAULT_TOKEN=$(vault login -method=userpass \
    username="$VAULT_USERNAME" \
    password="$VAULT_PASSWORD" \
    -format=json | jq -r .auth.client_token)
export VAULT_TOKEN

ENV_FILE="/app/.env"
: > "$ENV_FILE"  # empty or create the file

# Fetch secrets and write to .env
vault kv get -format=json env/backend \
| jq -r '.data.data | to_entries[] | @base64' \
| while IFS= read -r entry; do
    decoded=$(echo "$entry" | base64 -d)
    key=$(echo "$decoded" | jq -r '.key')
    value=$(echo "$decoded" | jq -r '.value')

    # Convert literal \n into actual newlines for PEM or cert files
    formatted_value=$(echo -e "$value")

    # For .env, escape actual newlines into \n form (dotenv expects single-line)
    # But write both versions: .env-safe and real PEM file if needed
    escaped_for_env=$(printf "%s" "$formatted_value" | sed ':a;N;$!ba;s/\n/\\n/g')

    # Write to .env
    echo "${key}=${escaped_for_env}" >> "$ENV_FILE"

    # Export real value to env for Node runtime
    export "$key"="$formatted_value"
done

# Ensure .env is readable
chmod 600 "$ENV_FILE"

# Run migrations
echo "Running database migrations..."
npm run migration:run

# Start the Node.js app
exec node dist/main.js
