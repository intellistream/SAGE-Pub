# Website Demo Kit (Asciinema)

This kit helps you create and embed "Live Terminal Demos" into the SAGE project website or documentation.

## Components

1.  **`record_helper.sh`**: A script to help you record a terminal session using `asciinema`.
2.  **`player-template.html`**: A copy-paste ready HTML snippet that includes the `asciinema-player` (v3.8.0), optimized for stability and playback experience (0.7x speed, auto-skip silence).

## Workflow

### 1. Install Asciinema

```bash
pip install asciinema
```

### 2. Record a Demo

Run the helper script:

```bash
cd devtools/website-demo-kit
./record_helper.sh sage-install-demo.cast
```

Perform the SAGE installation or usage steps you want to show. Type `exit` when done.

### 3. Embed in Website

1.  Copy the generated `.cast` file to your website's assets folder (e.g., `docs/assets/`).
2.  Open the page where you want the demo (e.g., `index.html` or a markdown file that supports raw HTML).
3.  Copy the code from `player-template.html`.
4.  Update the path in the code:
    ```javascript
    AsciinemaPlayer.create('/assets/sage-install-demo.cast', ...
    ```

## Customization

You can tweak the following in the JS config:

*   `speed`: Playback speed (currently `0.7`).
*   `theme`: Color scheme (try `dracula`, `tango`, `monokai`).
*   `rows` / `cols`: Size of the player window (match your terminal size).
