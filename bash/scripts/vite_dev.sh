#!/bin/bash

# --- Script Path Resolution (for vite_dev.sh itself) ---
SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  DIR="$( cd -P "$( dirname "$SOURCE" )" &> /dev/null && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  # if $SOURCE was a relative symlink, we need to resolve it relative to the path
  # where the symlink file was located
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
done
# SCRIPT_DIR is where vite_dev.sh resides: your_project_root/bash/scripts
SCRIPT_DIR="$( cd -P "$( dirname "$SOURCE" )" &> /dev/null && pwd )"

# PROJECT_ROOT is two levels up from SCRIPT_DIR: your_project_root/
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

# --- Helper Functions ---
# Removed start_vite_dev_server function as it's now handled by dev_terminal.sh directly

function stop_vite_dev_server() {
  local project_name=$1
  local pid_file="$SCRIPT_DIR/$project_name.pid"

  if [ -f "$pid_file" ]; then
    local pid=$(cat "$pid_file")
    if ps -p "$pid" > /dev/null; then
      echo "Stopping Vite dev server for $project_name (PID: $pid)..."
      kill "$pid"
      rm "$pid_file"
      echo "Server for $project_name stopped."
    else
      echo "No running process found for $project_name with PID $pid. Removing stale PID file."
      rm "$pid_file"
    fi
  else
    echo "No PID file found for $project_name. Server might not be running or was stopped manually."
  fi
}

# --- Main Logic ---
case "$1" in
  # Removed 'start' case, as dev_terminal.sh handles individual starts
  "stop")
    # Find all PID files and stop corresponding processes
    echo "Attempting to stop all running Vite dev servers..."
    for pid_file in "$SCRIPT_DIR"/*.pid; do
      if [ -f "$pid_file" ]; then
        project_name=$(basename "$pid_file" .pid)
        stop_vite_dev_server "$project_name"
      fi
    done
    ;;
  *)
    echo "Usage: $0 {stop}"
    echo "  Example (stop): $0 stop"
    echo "  (Typically called by dev_terminal.sh for stopping all servers)"
    exit 1
    ;;
esac
