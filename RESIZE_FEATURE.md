# Grafar Resize Feature

## Overview

The Grafar library now supports automatic window and container resizing! 3D visualizations dynamically adjust when the browser window or container element is resized.

## Key Features

- **Window Resize Events**: Panels automatically listen for window resize events
- **Container Resize Detection**: Uses ResizeObserver API for container resize detection
- **Programmatic Resize Support**: Responds to CSS changes and JavaScript resizing
- **View Preservation**: Maintains camera position and target during resize
- **Flicker-Free Updates**: 1ms debounced updates prevent visual artifacts
- **OrbitControls Integration**: Canvas wrapper isolates resize events from controls

## Usage

Resize functionality works automatically with no additional code:

```javascript
// Create a panel - resize handling is automatic
const panel = new grafar.Panel(document.getElementById('container'));

// Create visualization
const x = grafar.range(-2, 2, 50).select();
const y = grafar.range(-2, 2, 50).select();
const z = grafar.map([x, y], (x, y) => Math.sin(x) * Math.cos(y));

grafar.pin([x, y, z], panel);
// Panel automatically resizes when window or container changes
```

### Responsive Container
```css
#plot-container {
    width: 100%;
    height: 60vh;
    resize: both; /* Allow manual resizing */
    overflow: hidden;
}
```

### Programmatic Resize
```javascript
const container = document.getElementById('plot-container');
const panel = new grafar.Panel(container);

// Resize the container - panel automatically adjusts
container.style.width = '800px';
container.style.height = '600px';
```

## Technical Implementation

- **Debounced Updates**: 1ms debounce prevents flickering during resize
- **ResizeObserver API**: Modern container resize detection (96%+ browser support)
- **Canvas Wrapper**: Isolates OrbitControls from container resize events
- **View Preservation**: Maintains camera position during resize
- **WebGL Integration**: Proper viewport and renderer size updates

## Testing

Test example: `examples/resize_test.html`
- Window resize handling
- Manual container resizing (drag corner)
- Programmatic size changes
- Fullscreen mode with close button