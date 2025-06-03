#!/bin/bash

# --- Script Path Resolution (for new_page.sh itself) ---
SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  DIR="$( cd -P "$( dirname "$SOURCE" )" &> /dev/null && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  # if $SOURCE was a relative symlink, we need to resolve it relative to the path
  # where the symlink file was located
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
done
# SCRIPT_DIR is where new_page.sh resides: your_project_root/bash/scripts
SCRIPT_DIR="$( cd -P "$( dirname "$SOURCE" )" &> /dev/null && pwd )"

# PROJECT_ROOT is two levels up from SCRIPT_DIR: your_project_root/
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

# --- Helper Functions ---
function create_vite_project() {
  local project_name=$1
  local project_root=$2

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
  # Use npm, yarn, or pnpm depending on your preference
  # For pnpm workspaces, you might want to run 'pnpm create vite' from the root
  # or ensure the template includes workspace setup.
  # This example uses direct creation with npm
  npm create vite@latest "$project_path" -- --template react # Changed from react-ts to react for JSX
                                                      # You might need to install specific dependencies for plain JS/JSX
                                                      # if this template doesn't include them by default.

  if [ $? -eq 0 ]; then
    echo "Vite project '$project_name' created successfully."
    echo "Installing dependencies..."
    (cd "$project_path" && npm install) # or yarn install / pnpm install
    echo "Dependencies installed."
    echo "Remember to update your package.json (e.g., pnpm-workspace.yaml if using pnpm workspaces)."
  else
    echo "Failed to create Vite project."
  fi
}

function create_shared_component() {
  local component_name=$1
  local project_root=$2
  local components_dir="$project_root/_components"

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

  # Create an index.js for easier import
  cat <<EOF > "$component_path/index.js"
export { default } from './${component_name}';
EOF

  echo "Shared component '$component_name' created successfully."
  echo "You can now import it like: import ${component_name} from '@your_project_alias/_components/${component_name}';"
  echo "Remember to configure path aliases in your Vite configs if you haven't already."
}

# --- Main Logic ---
case "$1" in
  "vite_project")
    create_vite_project "$2" "$3"
    ;;
  "component")
    create_shared_component "$2" "$3"
    ;;
  *)
    echo "Usage: $0 {vite_project|component} [name] [project_root]"
    echo "  Example: $0 vite_project MyNewApp \$PROJECT_ROOT"
    echo "  Example: $0 component MyButton \$PROJECT_ROOT"
    echo "  (Typically called by dev_terminal.sh)"
    exit 1
    ;;
esac