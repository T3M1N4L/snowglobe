# Snow Globe

## Overview
This project creates an interactive 3D snow globe using Three.js. Users can interact with the globe by dragging it to move the snow, creating a festive and immersive experience.

## Features
- **Interactive Snow Globe**: Drag to move the snow.
- **Realistic Snowfall**: Utilizes custom shaders for snowflake dynamics.
- **3D Model Integration**: Displays a custom-designed globe model.
- **Responsive Design**: Adjusts rendering to different screen sizes.

## Technologies Used
- **HTML5**: Structure of the web page.
- **CSS**: Basic styling.
- **JavaScript**: Application logic and interactions.
- **Three.js**: 3D rendering and scene management.
- **Shaders**: Custom vertex and fragment shaders for snow effect.

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/T3M1N4L/snowglobe.git
   ```

2. Navigate to the project directory:
   ```bash
   cd snowglobe
   ```


4. Run a local server (e.g., using VS Code's Live Server or Python HTTP server):
   ```bash
   python -m http.server
   ```

5. Open `index.html` in a web browser.

## File Structure
- **index.html**: Main HTML file.
- **style.css**: Styling for the page.
- **script.js**: Core logic and rendering code.
- **assets/**: Contains textures, models, and other resources.

## Controls
- Drag the globe using the mouse to interact with the snow.

## Shaders
- **Vertex Shader**: Manages snowflake positioning and movement.
- **Fragment Shader**: Controls snowflake appearance and transparency.

## Customization
To modify the project:
1. **Change Snowflake Count**: Update the `count` parameter in the `World` class.
2. **Modify Colors**: Adjust `uR`, `uG`, and `uB` uniform values in `addSnow`.
3. **Replace Models**: Replace `snowglobe-1.glb` in the `assets` directory.

## Credits
- **Three.js**: For enabling WebGL rendering.
- **Shaders**: Custom GLSL code for snow simulation.