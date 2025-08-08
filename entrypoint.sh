#!/bin/bash
set -e

export VAULT_ADDR=$VAULT_ADDR

VAULT_TOKEN=$(vault login -method=userpass username="$VAULT_USERNAME" password="$VAULT_PASSWORD" -format=json | jq -r .auth.client_token)

export VAULT_TOKEN

eval $(vault kv get -format=json env/okr | jq -r '.data.data | to_entries[] | "export \(.key)=\(.value)"')

exec node dist/main.js
