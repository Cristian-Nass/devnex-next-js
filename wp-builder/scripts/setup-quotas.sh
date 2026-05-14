#!/usr/bin/env bash
# Disk quota setup is no longer needed.
#
# WP Builder uses application-level disk tracking:
#   - The API runs `du -sb` on each site directory every 5 minutes.
#   - Usage is stored in the database and shown as a progress bar in the dashboard.
#   - Per-site limits are set via PATCH /api/sites/:id or the dashboard UI.
#
# To enable, add to server/.env:
#   QUOTA_ENABLED=true
#   SITE_DISK_QUOTA_GB=5
#
# No kernel changes, no special filesystem setup, no VPS risk.
echo "No host setup needed. Set QUOTA_ENABLED=true in server/.env and rebuild the API."
