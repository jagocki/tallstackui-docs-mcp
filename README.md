# TallStackUI Documentation MCP Server

A Model Context Protocol (MCP) server that provides access to TallStackUI v2 documentation. This server allows AI assistants to search and retrieve documentation for TallStackUI components directly from https://tallstackui.com/docs/v2/.

## Features

- **Search Documentation**: Search for components and topics across TallStackUI docs
- **Get Component Info**: Retrieve detailed documentation for specific components
- **List Components**: Browse all available components organized by category
- **Get Page Content**: Fetch any documentation page by path

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

- **Getting Started**: Documentation, installation, configuration
- **UI Components**: Alert, avatar, badge, banner, button, card, clipboard, dropdown, icon, layout, link, loading, modal, slide, stats, step, tab, tag, toast, tooltip
- **Form Components**: Checkbox, color, date, input, number, password, pin, radio, range, select, textarea, time, toggle, upload
- **Interaction Components**: Dialog, reaction
- **Other**: Theme, helpers, upgrade guide

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
