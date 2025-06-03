#!/bin/bash
# set -x # Removed as requested

# --- Robustly find the actual directory of this script (dev_terminal.sh) ---
# This resolves symlinks and gives the true path to the script's directory.
SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  DIR="$( cd -P "$( dirname "$SOURCE" )" &> /dev/null && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  # if $SOURCE was a relative symlink, we need to resolve it relative to the path
  # where the symlink file was located
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
done
# SCRIPT_DIR_MAIN will be the directory containing this script (e.g., /home/mark/Documents/wade/bash/)
SCRIPT_DIR_MAIN="$( cd -P "$( dirname "$SOURCE" )" &> /dev/null && pwd )"

# PROJECT_ROOT will be the top-level project directory (e.g., /home/mark/Documents/wade/)
PROJECT_ROOT="$(dirname "$SCRIPT_DIR_MAIN")" # Assumes script is in a direct child of PROJECT_ROOT (e.g., 'bash')


#region -----Constants & Default Values-----
# Use the dynamically determined PROJECT_ROOT
PROJECT_DIR="$PROJECT_ROOT" # This is the main project directory containing 1_client, _components etc.

# Default values for network settings - these can be overridden by .env
REMOTE_USER="mark"
REMOTE_SERVER_IP="159.223.207.34"
DIRECTUS_ADMIN_URL="https://api.wade-usa.com"
DEFAULT_VITE_URL="http://localhost:5173" # Default URL for a Vite dev server

# Command to be run in a new terminal for SSH.
# Note: Using single quotes for SSH_COMMAND_FOR_NEW_TERMINAL to preserve special characters for bash -c
SSH_COMMAND_FOR_NEW_TERMINAL="echo 'Attempting SSH to ${REMOTE_USER}@${REMOTE_SERVER_IP}...'; ssh ${REMOTE_USER}@${REMOTE_SERVER_IP}; echo 'SSH session ended. This terminal will remain open.'; exec /bin/bash"

# No need to export these global constants explicitly if they are only used within this single script.
# If you plan to break this script into smaller pieces later, re-evaluate exports.
#endregion

#region -----.env import-----
# Load environment variables from .env file located in the same directory as this script.
# Values in .env will override the constants defined above.
ENV_FILE_PATH_MAIN="${SCRIPT_DIR_MAIN}/.env"

if [ -f "$ENV_FILE_PATH_MAIN" ]; then
    echo "Loading environment variables from: $ENV_FILE_PATH_MAIN"
    source "$ENV_FILE_PATH_MAIN"
else
    echo "Warning: Main environment file '$ENV_FILE_PATH_MAIN' not found. Using hardcoded defaults."
fi
#endregion

# ----- Set the title for THIS terminal window -----
printf "\033]0;WadeUSA Dev Terminal\007" # Updated title

#region -----Helper Functions (Generic)-----
function clear_screen() {
  printf "\033c" # ANSI escape code to clear screen
}

# --- Utility Logging Functions ---
# For consistent and colored output
log_info() {
    echo -e "\e[34m[INFO]\e[0m $1"
}
log_success() {
    echo -e "\e[32m[SUCCESS]\e[0m $1"
}
log_error() {
    echo -e "\e[31m[ERROR]\e[0m $1"
}
log_warn() {
    echo -e "\e[33m[WARNING]\e[0m $1"
}
#endregion

#region -----Core Functionality Functions-----

# Function to open VS Code
open_VS () {
  if [[ -n "$PROJECT_DIR" ]]; then
    echo "Attempting to open VS Code for Project at: $PROJECT_DIR"
    if [ -d "$PROJECT_DIR" ]; then
        code "$PROJECT_DIR" # 'code' is the command for VS Code
        echo "VS Code launch command issued."
    else
        echo "Error: Project directory not found at '$PROJECT_DIR'"
        echo "Please check the PROJECT_DIR variable in the script or .env file."
    fi
  else
    echo "Error: PROJECT_DIR is not set in script or .env file."
  fi
  read -p "Press Enter to return to menu..."
}

# Function to create a new Vite project
function create_vite_project() {
  local project_name=$1 # Passed as argument, or prompted if empty
  local project_root="$PROJECT_DIR" # Always use the main project root

  if [ -z "$project_name" ]; then
    read -p "Enter new Vite project name (e.g., 3_anotherModule): " project_name
  fi

  if [ -z "$project_name" ]; then
    echo "Project name cannot be empty. Aborting."
    return 1
  fi

  # Define project_path *after* project_name has been definitively set (either from arg or user input).
  local project_path="$project_root/$project_name"

  if [ -d "$project_path" ]; then
    echo "Error: Project directory '$project_path' already exists." # This error message should now be correct
    return 1
  fi

  echo "Creating new Vite project '$project_name' at '$project_path'..."
  # Change directory to the intended parent directory ($PROJECT_DIR)
  # before running npm create, and pass the *relative* project name.
  (cd "$project_root" && npm create vite@latest "$project_name" -- --template react)

  if [ $? -eq 0 ]; then
    echo "Vite project '$project_name' created successfully."
    echo "Installing dependencies..."
    (cd "$project_path" && npm install) # This should now work as the directory exists correctly.
    echo "Dependencies installed."
    echo "Remember to update your package.json (e.g., pnpm-workspace.yaml if using pnpm workspaces)."
  else
    echo "Failed to create Vite project."
  fi
}

# Function to create a new shared component
function create_shared_component() {
  local component_name=$1 # Passed as argument, or prompted if empty
  local components_dir="$PROJECT_DIR/_components" # Assumes _components is directly under PROJECT_DIR

  if [ -z "$component_name" ]; then
    read -p "Enter new shared component name (e.g., MyNewButton): " component_name
  fi

  if [ -z "$component_name" ]; then
    echo "Component name cannot be empty. Aborting."
    return 1
  fi

  local component_path="$components_dir/$component_name"

  if [ -d "$component_path" ]; then
    echo "Error: Component directory '$component_path' already exists."
    return 1
  fi

  echo "Creating new shared component '$component_name' at '$component_path'..."
  mkdir -p "$component_path"

  # Create a basic React component file with .jsx extension
  cat <<EOF > "$component_path/$component_name.jsx"
import React from 'react';
import './${component_name}.css'; // <-- Added CSS import here!

const ${component_name} = ({ message = "Hello from ${component_name}!" }) => {
  return (
    <div className="p-4 border rounded shadow-md bg-white">
      <h3 className="text-lg font-semibold text-gray-800">${component_name}</h3>
      <p className="text-gray-600">{message}</p>
    </div>
  );
};

export default ${component_name};
EOF

  # Create the corresponding .css file (empty or with a comment)
  cat <<EOF > "$component_path/$component_name.css"
/* Styles for ${component_name} component */
.your-${component_name}-class {
    /* Add your styles here */
}
EOF

  # Removed the index.js creation block as requested

  echo "Shared component '$component_name' created successfully."
  echo "You can now import it like: import ${component_name} from '@your_project_alias/_components/${component_name}';"
  echo "Remember to configure path aliases in your Vite configs if you haven't already."
}

# Function to start a single Vite dev server and open in Chrome
function start_single_vite_dev_server() {
    clear_screen
    echo "==================================="
    echo "     Select Vite Project to Start    "
    echo "==================================="

    declare -a project_paths
    declare -a project_names

    # Loop through subdirectories in the PROJECT_DIR
    for item in "$PROJECT_DIR"/*/; do
        if [ -d "$item" ]; then # If it's a directory
            project_name=$(basename "$item")
            # Check if name matches pattern "number_*" (e.g., 1_client, 02_app)
            # AND it has a package.json
            # AND package.json mentions "vite" (basic check for Vite project)
            if [[ "$project_name" =~ ^[0-9]+_.* && -f "${item}package.json" ]]; then
                if grep -qE '"(dev|start)":.*vite' "${item}package.json"; then
                    project_paths+=("$item")
                    project_names+=("$project_name")
                fi
            fi
        fi
    done

    if [ ${#project_names[@]} -eq 0 ]; then
        echo "No Vite projects found matching the pattern '[0-9]*_*' with a 'dev' or 'start' script mentioning 'vite'"
        echo "in '$PROJECT_DIR'."
        read -n 1 -s -r -p "Press any key to return to Dev Options Menu..."
        return # Exit this function
    fi

    echo # Blank line
    echo "Available Vite projects:"

    PS3="Select a project to start (or type 'q' to cancel): "
    select selected_project_name in "${project_names[@]}" "Cancel"; do
        if [[ "$REPLY" == "q" || "$selected_project_name" == "Cancel" ]]; then
            echo "Operation cancelled."
            break # Exit the select loop
        fi

        if [[ -n "$selected_project_name" ]]; then
            selected_project_path=""
            for i in "${!project_names[@]}"; do
                if [[ "${project_names[$i]}" == "$selected_project_name" ]]; then
                    selected_project_path="${project_paths[$i]}"
                    break
                fi
            done

            if [[ -z "$selected_project_path" ]]; then
                echo "Error: Could not determine path for '$selected_project_name'."
                continue # Go back to select prompt
            fi

            echo "You selected: $selected_project_name (Path: $selected_project_path)"
            
            # --- Start Vite Dev Server in New Terminal ---
            echo "Launching Vite dev server for '$selected_project_name' in a new GNOME Terminal..."
            # The PID file will be created in the SCRIPT_DIR_MAIN (bash/ folder)
            local pid_file="${SCRIPT_DIR_MAIN}/${selected_project_name}.pid"
            gnome-terminal --working-directory="${selected_project_path}" --title="${selected_project_name}-ViteDev" -- /bin/bash -c "echo 'Starting Vite dev server (npm run dev)...'; echo 'To stop, close this terminal or use the main script.'; npm run dev; rm -f ${pid_file}; exec /bin/bash" &
            echo $! > "$pid_file" # Save PID of the gnome-terminal process
            echo "PID saved for '$selected_project_name' to '$pid_file'."
            
            # --- Open in Google Chrome ---
            echo "Waiting a few seconds for the dev server to potentially start..."
            sleep 5 # Adjust this delay if your server takes longer/shorter to start

            echo "Attempting to open $DEFAULT_VITE_URL in Google Chrome..."
            google-chrome "$DEFAULT_VITE_URL" &

            echo # Blank line
            echo "Commands to start dev server and open Chrome have been issued."
            echo "The dev server for '$selected_project_name' should be running in a new terminal window."
            echo "If Chrome didn't open to the right page, check the port in the new terminal (usually $DEFAULT_VITE_URL)."
            break # Exit the select loop after successful launch
        else
            echo "Invalid selection. Please try again."
        fi
    done
}

# Function to stop all running Vite dev servers
function stop_all_vite_dev_servers() {
  echo "Attempting to stop all running Vite dev servers..."
  local pids_found=0
  for pid_file in "$SCRIPT_DIR_MAIN"/*.pid; do
    if [ -f "$pid_file" ]; then
      project_name=$(basename "$pid_file" .pid)
      pid=$(cat "$pid_file")
      if ps -p "$pid" > /dev/null; then
        echo "Stopping Vite dev server for $project_name (PID: $pid)..."
        kill "$pid" # Kill the gnome-terminal process
        rm "$pid_file"
        echo "Server for $project_name stopped."
        pids_found=$((pids_found+1))
      else
        echo "No running process found for $project_name with PID $pid. Removing stale PID file."
        rm "$pid_file"
      fi
    fi
  done
  if [ "$pids_found" -eq 0 ]; then
    echo "No Vite dev servers or stale PID files found."
  fi
}

# --- Git Operations Function ---
# Manages common Git commands for the monorepo
_git_operations() {
    # Using the dynamically determined PROJECT_ROOT as the Git repository root
    local git_repo_root="$PROJECT_ROOT"

    # Check if .git directory exists
    if [ ! -d "$git_repo_root/.git" ]; then
        log_error "Git repository not found at $git_repo_root/.git."
        log_error "Please initialize Git in this directory using 'git init' first."
        read -p "Press Enter to return to the Main Menu..."
        return
    fi

    # Change into the Git repository directory for operations
    # Store current PWD to return later
    local original_pwd="$PWD"
    log_info "Navigating to Git repository: $git_repo_root"
    cd "$git_repo_root" || { log_error "Failed to change directory to $git_repo_root. Aborting Git operations."; read -p "Press Enter to continue..."; return; }

    while true; do
        clear_screen # Clear screen for a cleaner menu
        log_info "--- Git Operations Menu ---"
        echo "1. Git Status (Check current changes)"
        echo "2. Git Add All & Commit (Stage all changes and commit)"
        echo "3. Git Push (Push local commits to remote)"
        echo "4. Git Pull (Fetch and merge changes from remote)"
        echo "0. Back to Main Menu"
        echo "---------------------------"
        read -p "Enter your choice: " git_choice

        case "$git_choice" in
            1)
                log_info "Running: git status"
                git status
                read -p "Press Enter to continue..."
                ;;
            2)
                read -p "Enter your commit message: " commit_msg
                if [ -z "$commit_msg" ]; then
                    log_warn "Commit message cannot be empty. Aborting commit."
                else
                    log_info "Staging all changes and committing..."
                    git add .
                    if git commit -m "$commit_msg"; then
                        log_success "Changes committed successfully!"
                    else
                        log_error "Failed to commit changes. Check output above."
                    fi
                fi
                read -p "Press Enter to continue..."
                ;;
            3)
                log_info "Running: git push"
                current_branch=$(git rev-parse --abbrev-ref HEAD) # Get current branch name
                if git push origin "$current_branch"; then
                    log_success "Pushed changes to $current_branch successfully!"
                else
                    log_error "Failed to push changes. Check remote URL and connection."
                fi
                read -p "Press Enter to continue..."
                ;;
            4)
                log_info "Running: git pull"
                current_branch=$(git rev-parse --abbrev-ref HEAD)
                if git pull origin "$current_branch"; then
                    log_success "Pulled changes from $current_branch successfully!"
                else
                    log_error "Failed to pull changes. Check remote URL and connection."
                fi
                read -p "Press Enter to continue..."
                ;;
            0)
                log_info "Returning to Main Menu."
                cd "$original_pwd" || { log_error "Failed to return to original directory."; }
                return # Exit the function
                ;;
            *)
                log_error "Invalid choice. Please try again."
                read -p "Press Enter to continue..."
                ;;
        esac
    done
}


#endregion

#region -----Menu Functions (UI)-----

# Menu for Developer Options (VS Code, Vite Servers)
menu_1_ui (){
    while true; do
        clear_screen
        echo "==================================="
        echo "     WadeUSA - Dev Options Menu    "
        echo "==================================="
        echo "-----------------------------------"
        echo "1. Open Main Project In VS Code"
        echo "2. Start Vite Project Dev Server (Select & Open)"
        # Option 3 "Stop ALL running Vite Dev Servers" removed as requested
        echo "0. Return to Main Menu"
        echo "-----------------------------------"

        read -p "Enter your choice: " user_choice
        echo

        case $user_choice in
            1) open_VS ;; # Calls the function
            2) start_single_vite_dev_server ;; # Calls the new integrated function
            # Removed case 3 for "Stop ALL running Vite Dev Servers"
            0)
                echo "Returning to Main Menu"
                sleep 1
                break
                ;;
            *)
                echo "Invalid choice. Please try again."
                sleep 1
                ;;
        esac
    done
}

# Menu for Server Options (SSH)
menu_2_ui () {
    while true; do
        clear_screen
        echo "==================================="
        echo "     WadeUSA - Server Options      "
        echo "==================================="
        echo "-----------------------------------"
        echo "1. SSH into Server ('${REMOTE_USER}@${REMOTE_SERVER_IP}') (New Terminal)"
        echo "0. Return to Main Menu"
        echo "-----------------------------------"

        read -p "Enter your choice: " user_choice
        echo

        case $user_choice in
            1)
                if [[ -n "$REMOTE_USER" && -n "$REMOTE_SERVER_IP" ]]; then
                    echo "Opening new terminal for SSH connection..."
                    gnome-terminal -- /bin/bash -c "${SSH_COMMAND_FOR_NEW_TERMINAL}" & # Run in background
                    echo "New terminal window was launched."
                    read -p "Press Enter to return to menu..."
                else
                    echo "Error: REMOTE_USER or REMOTE_SERVER_IP not configured in script or .env."
                    sleep 2
                fi
                ;;
            0)
            echo "Returning to Main Menu"
            sleep 1
            break
            ;;
            *)
            echo "Invalid choice. Please try again."
            sleep 1
            ;;
        esac # Corrected from esolac
    done
}

# Menu for Project Creation
menu_create_ui() {
    while true; do
        clear_screen
        echo "=========================================="
        echo "  Create New React App/Page/Component "
        echo "=========================================="
        echo "------------------------------------------"
        echo "1. Create New Vite Project (e.g., 3_newModule)"
        echo "2. Create New Shared Component (in _components)"
        echo "0. Back to Main Menu"
        echo "------------------------------------------"
        read -p "Enter your choice: " create_choice
        echo

        case $create_choice in
            1) # Create New Vite Project
                echo "Launching new Vite project creation..."
                create_vite_project "" # Call function, prompt for name
                read -p "Press Enter to return to creation menu..."
                ;;
            2) # Create New Shared Component
                echo "Launching new shared component creation..."
                create_shared_component "" # Call function, prompt for name
                read -p "Press Enter to return to creation menu..."
                ;;
            0)
                echo "Returning to Main Menu."
                sleep 1
                break
                ;;
            *)
                echo "Invalid choice. Please try again."
                sleep 1
                ;;
        esac
    done
}

#endregion

#region ---Main Program Loop (UI)---
while true; do
    clear_screen
    echo "==================================="
    echo " WadeUSA Development Script Menu "
    echo "==================================="
    date # This will print the current date/time

    echo "1. VS Code Options (Main Project)"
    echo "2. Server Options"
    echo "3. Open Directus Admin"
    echo "4. Create New React App/Page"
    echo "5. Git Operations" # NEW OPTION ADDED HERE
    echo "q. Quit"
    echo "-----------------------------------"

    read -p "Enter your choice: " user_choice
    echo

    case $user_choice in
        1) menu_1_ui ;;
        2) menu_2_ui ;;
        3)
            if [[ -n "$DIRECTUS_ADMIN_URL" ]]; then
                echo "Opening Directus Admin (${DIRECTUS_ADMIN_URL}) in browser..."
                xdg-open "${DIRECTUS_ADMIN_URL}" & # xdg-open for Linux, 'open' for macOS, 'start' for Windows (if using WSL)
                echo "Browser launch command issued."
            else
                echo "Error: DIRECTUS_ADMIN_URL not defined in script or .env."
            fi
            read -p "Press Enter to return to main menu..."
            ;;
        4) menu_create_ui ;;
        5) _git_operations ;; # CALL TO NEW GIT FUNCTION
        q | Q)
            echo "Exiting script"
            exit 0
            ;;
        *)
            echo "Invalid choice. Please try again."
            sleep 1
            ;;
    esac
done
#endregion