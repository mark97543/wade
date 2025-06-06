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
DIRECTUS_ADMIN_URL="https://api.wade-usa.com"
DEFAULT_VITE_URL="http://localhost:5173" # Default URL for a Vite dev server
SSH_USER="your_user" # Default SSH user
SSH_HOST="your_server_ip" # Default SSH host
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

# --- NEW: Function to SSH into the live server ---
_ssh_into_server() {
    if [[ -z "$SSH_USER" || -z "$SSH_HOST" || "$SSH_HOST" == "your_server_ip" ]]; then
        log_error "SSH user or host not configured."
        log_warn "Please set SSH_USER and SSH_HOST in your bash/.env file."
        read -p "Press Enter to return to menu..."
        return
    fi

    log_info "Attempting to connect to ${SSH_HOST} as user ${SSH_USER}..."
    ssh "${SSH_USER}@${SSH_HOST}"
    log_success "SSH session ended."
    read -p "Press Enter to return to menu..."
}

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
  local project_name=$1
  local project_root="$PROJECT_DIR"

  if [ -z "$project_name" ]; then
    read -p "Enter new Vite project name (e.g., 3_anotherModule): " project_name
  fi

  if [ -z "$project_name" ]; then
    echo "Project name cannot be empty. Aborting."
    return 1
  fi

  local project_path="$project_root/$project_name"

  if [ -d "$project_path" ]; then
    echo "Error: Project directory '$project_path' already exists."
    return 1
  fi

  echo "Creating new Vite project '$project_name' at '$project_path'..."
  (cd "$project_root" && npm create vite@latest "$project_name" -- --template react)

  if [ $? -eq 0 ]; then
    echo "Vite project '$project_name' created successfully."
    echo "Installing dependencies..."
    (cd "$project_path" && npm install)
    echo "Dependencies installed."
    echo "Remember to update your package.json workspaces configuration."
  else
    echo "Failed to create Vite project."
  fi
}

# Function to create a new shared component
function create_shared_component() {
  local component_name=$1
  local components_dir="$PROJECT_DIR/_components"

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

  cat <<EOF > "$component_path/$component_name.jsx"
import React from 'react';
import './${component_name}.css';

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

  cat <<EOF > "$component_path/$component_name.css"
/* Styles for ${component_name} component */
.your-${component_name}-class {
    /* Add your styles here */
}
EOF

  echo "Shared component '$component_name' created successfully."
}

# Function to start a single Vite dev server
function start_single_vite_dev_server() {
    clear_screen
    echo "==================================="
    echo "     Select Vite Project to Start    "
    echo "==================================="

    declare -a project_paths
    declare -a project_names

    for item in "$PROJECT_DIR"/*/; do
        if [ -d "$item" ]; then
            project_name=$(basename "$item")
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
        read -n 1 -s -r -p "Press any key to return..."
        return
    fi

    echo "Available Vite projects:"
    PS3="Select a project to start (or type 'q' to cancel): "
    select selected_project_name in "${project_names[@]}" "Cancel"; do
        if [[ "$REPLY" == "q" || "$selected_project_name" == "Cancel" ]]; then
            echo "Operation cancelled."
            break
        fi

        if [[ -n "$selected_project_name" ]]; then
            selected_project_path=""
            for i in "${!project_names[@]}"; do
                if [[ "${project_names[$i]}" == "$selected_project_name" ]]; then
                    selected_project_path="${project_paths[$i]}"
                    break
                fi
            done

            local pid_file="${SCRIPT_DIR_MAIN}/${selected_project_name}.pid"
            gnome-terminal --working-directory="${selected_project_path}" --title="${selected_project_name}-ViteDev" -- /bin/bash -c "echo 'Starting Vite dev server...'; npm run dev; rm -f ${pid_file}; exec /bin/bash" &
            echo $! > "$pid_file"
            
            echo "Waiting a few seconds for the dev server..."
            sleep 2
            google-chrome "$DEFAULT_VITE_URL" &
            break
        else
            echo "Invalid selection."
        fi
    done
}

# --- Git Operations Function ---
_git_operations() {
    local git_repo_root="$PROJECT_ROOT"

    if [ ! -d "$git_repo_root/.git" ]; then
        log_error "Git repository not found at $git_repo_root/.git."
        read -p "Press Enter to return..."
        return
    fi

    local original_pwd="$PWD"
    cd "$git_repo_root" || return

    while true; do
        clear_screen
        log_info "--- Git Operations Menu ---"
        echo "1. Git Status"
        echo "2. Git Add All & Commit"
        echo "3. Git Push"
        echo "4. Git Pull"
        echo "0. Back to Main Menu"
        echo "---------------------------"
        read -p "Enter your choice: " git_choice

        case "$git_choice" in
            1) git status; read -p "Press Enter...";;
            2)
                read -p "Enter your commit message: " commit_msg
                if [ -n "$commit_msg" ]; then
                    git add . && git commit -m "$commit_msg"
                else
                    log_warn "Commit message cannot be empty."
                fi
                read -p "Press Enter...";;
            3)
                current_branch=$(git rev-parse --abbrev-ref HEAD)
                git push origin "$current_branch"
                read -p "Press Enter...";;
            4)
                current_branch=$(git rev-parse --abbrev-ref HEAD)
                git pull origin "$current_branch"
                read -p "Press Enter...";;
            0)
                cd "$original_pwd"
                return;;
            *)
                log_error "Invalid choice."; read -p "Press Enter...";;
        esac
    done
}
#endregion

#region -----Menu Functions (UI)-----

menu_1_ui (){
    while true; do
        clear_screen
        echo "==================================="
        echo "     WadeUSA - Dev Options Menu    "
        echo "==================================="
        echo "1. Open Main Project In VS Code"
        echo "2. Start Vite Project Dev Server"
        echo "0. Return to Main Menu"
        echo "-----------------------------------"
        read -p "Enter your choice: " user_choice
        case $user_choice in
            1) open_VS ;;
            2) start_single_vite_dev_server ;;
            0) break;;
            *) echo "Invalid choice.";;
        esac
    done
}

menu_create_ui() {
    while true; do
        clear_screen
        echo "=========================================="
        echo "  Create New React App/Page/Component "
        echo "=========================================="
        echo "1. Create New Vite Project"
        echo "2. Create New Shared Component"
        echo "0. Back to Main Menu"
        echo "------------------------------------------"
        read -p "Enter your choice: " create_choice
        case $create_choice in
            1) create_vite_project ""; read -p "Press Enter...";;
            2) create_shared_component ""; read -p "Press Enter...";;
            0) break;;
            *) echo "Invalid choice.";;
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
    date

    echo "1. VS Code & Dev Server Options"
    echo "2. Open Directus Admin"
    echo "3. Create New React App/Page"
    echo "4. Git Operations"
    echo "5. SSH into Live Server" # <-- NEW OPTION
    echo "q. Quit"
    echo "-----------------------------------"

    read -p "Enter your choice: " user_choice
    echo

    case $user_choice in
        1) menu_1_ui ;;
        2)
            if [[ -n "$DIRECTUS_ADMIN_URL" ]]; then
                xdg-open "${DIRECTUS_ADMIN_URL}" &
            else
                echo "Error: DIRECTUS_ADMIN_URL not defined."
            fi
            read -p "Press Enter..."
            ;;
        3) menu_create_ui ;;
        4) _git_operations ;;
        5) _ssh_into_server ;; # <-- NEW CASE
        q | Q)
            echo "Exiting script"
            exit 0
            ;;
        *)
            echo "Invalid choice."
            ;;
    esac
done
#endregion