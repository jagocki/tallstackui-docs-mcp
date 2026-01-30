# TallStackUI Documentation MCP Server

A Model Context Protocol (MCP) server that provides access to TallStackUI v2 documentation. This server allows AI assistants to search and retrieve documentation for TallStackUI components directly from https://tallstackui.com/docs/v2/.

## Features

- **Search Documentation**: Search for components and topics across TallStackUI docs
- **Get Component Info**: Retrieve detailed documentation for specific components
- **List Components**: Browse all available components organized by category
- **Get Page Content**: Fetch any documentation page by path
- **Local Caching**: Automatically caches documentation pages locally for faster access and offline availability of previously fetched pages

This server provides access to **51 documentation pages** covering TallStackUI v2 components and guides.

## Installation

### From NPM (when published)

```bash
npm install -g tallstackui-docs-mcp
```

### From Source

```bash
git clone https://github.com/jagocki/tallstackui-docs-mcp.git
cd tallstackui-docs-mcp
npm install
npm run build
```

## Usage

### Configuration

The server can be configured using the following environment variables:

- `TALLSTACKUI_DOCS_URL` (optional): Base URL for TallStackUI documentation. Defaults to `https://tallstackui.com/docs/v2`
- `MAX_CONTENT_SIZE` (optional): Maximum content size in characters for documentation pages. Defaults to `15000`
- `CACHE_DIR` (optional): Directory for caching documentation pages. Defaults to `.cache`
- `CACHE_TTL` (optional): Cache time-to-live in seconds. Defaults to `3600` (1 hour)

#### Caching

The server automatically caches fetched documentation pages locally to improve performance and enable offline access to previously fetched pages. The cache:

- Stores pages in the `.cache` directory (configurable via `CACHE_DIR`)
- Expires after 1 hour by default (configurable via `CACHE_TTL`)
- Reduces load on the TallStackUI website
- Provides faster response times after the first fetch
- Enables offline access to pages that have been previously cached

To clear the cache, simply delete the cache directory:
```bash
rm -rf .cache
```

### Requirements

- Node.js >= 20.18.1

### With Claude Desktop

Add this to your Claude Desktop configuration file (see `claude_desktop_config.example.json` for a complete example):

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "tallstackui-docs": {
      "command": "node",
      "args": ["/path/to/tallstackui-docs-mcp/dist/index.js"]
    }
  }
}
```

Or if installed globally via npm:

```json
{
  "mcpServers": {
    "tallstackui-docs": {
      "command": "tallstackui-docs-mcp"
    }
  }
}
```

### With VSCode

To use this MCP server with VSCode, you'll need to install an MCP-compatible extension.

#### Using Cline Extension (Recommended)

1. **Install the Cline extension** from the VSCode marketplace:
   - Open VSCode
   - Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
   - Search for "Cline"
   - Click Install

2. **Configure the MCP server**:
   - Open VSCode settings (File > Preferences > Settings or Ctrl+,)
   - Search for "Cline MCP"
   - Click "Edit in settings.json"
   - Add the following configuration:

```json
{
  "cline.mcpServers": {
    "tallstackui-docs": {
      "command": "node",
      "args": ["/absolute/path/to/tallstackui-docs-mcp/dist/index.js"],
      "env": {
        "CACHE_DIR": "/absolute/path/to/tallstackui-docs-mcp/.cache"
      }
    }
  }
}
```

**Important:** Use absolute paths for both the server executable and the CACHE_DIR to ensure the cache is created in the correct location. See `vscode_settings.example.json` for a complete example.

3. **Using the tools**:
   - Open Cline in VSCode (click the Cline icon in the sidebar)
   - The TallStackUI documentation tools will be available to the AI assistant
   - Ask questions like "Show me the TallStackUI button component documentation"

#### Alternative: Using Continue Extension

1. **Install Continue extension** from the VSCode marketplace

2. **Configure MCP server** in Continue's config file (`~/.continue/config.json`):

```json
{
  "mcpServers": [
    {
      "name": "tallstackui-docs",
      "command": "node",
      "args": ["/absolute/path/to/tallstackui-docs-mcp/dist/index.js"]
    }
  ]
}
```

#### Tips for VSCode Usage

- Make sure to use absolute paths in your configuration
- Restart VSCode after adding the MCP server configuration
- Check the extension's output panel if the server doesn't connect
- The cache will be created in the server's directory, making subsequent queries faster

### With Other MCP Clients

The server uses stdio for communication. Run it with:

```bash
npm start
# or
node dist/index.js
```

## Available Tools

### `search_docs`

Search TallStackUI documentation for components or topics.

**Parameters:**
- `query` (string, required): Search query (component name, topic, or keyword)

**Example:**
```json
{
  "query": "button"
}
```

### `get_component`

Get documentation for a specific TallStackUI component.

**Parameters:**
- `component` (string, required): Component name (e.g., 'button', 'input', 'modal')

**Example:**
```json
{
  "component": "button"
}
```

### `list_components`

List all available TallStackUI components organized by category.

**No parameters required.**

### `get_page`

Get the content of a specific documentation page.

**Parameters:**
- `path` (string, required): Documentation page path (e.g., 'ui/button', 'form/input')

**Example:**
```json
{
  "path": "ui/button"
}
```

## Component Categories

TallStackUI components are organized into the following categories:

- **Getting Started** (4 pages): Documentation, installation, configuration, starter kit
- **UI Components** (26 components): Alert, avatar, badge, banner, boolean, button, card, carousel, clipboard, dropdown, environment, icon, layout, link, loading, modal, progress, rating, signature, slide, stats, step, tab, table, toast, tooltip
- **Form Components** (16 components): Checkbox, color, currency, date, input, number, password, pin, radio, range, select, tag, textarea, time, toggle, upload
- **Interaction Components** (2 components): Dialog, reaction
- **Other** (3 pages): Theme, helpers, upgrade guide

**Total: 51 documentation pages**

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Watch mode for development
npm run watch

# Run the server
npm start
```

## About TallStackUI

TallStackUI is a powerful suite of components for building applications with the TALL stack (Tailwind CSS, Alpine.js, Laravel, and Livewire). For more information, visit [tallstackui.com](https://tallstackui.com).

## License

MIT
