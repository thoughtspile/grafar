# Grafar Resize Feature

## Overview

The Grafar library now supports automatic window and container resizing! This enhancement allows 3D visualizations to dynamically adjust when the browser window or container element is resized, making the library much more robust for responsive web applications.

## Key Features

### Automatic Resize Handling
- **Window Resize Events**: Panels automatically listen for window resize events
- **Container Resize Detection**: Uses ResizeObserver API with fallback polling for older browsers
- **Programmatic Resize Support**: Responds to CSS changes, JavaScript resizing, and dynamic layout changes
- **View Preservation**: Maintains camera position and target during resize
- **Aspect Ratio Preservation**: Camera aspect ratios are automatically updated
- **Flicker-Free Updates**: Debounced updates prevent visual artifacts during resize
- **OrbitControls Integration**: Resize handle conflicts resolved with proper event handling

### New Methods

#### `Panel.destroy()`
Clean up a panel and remove it from the global panels array:
```javascript
const panel = new grafar.Panel(container);
panel.destroy(); // Clean up event listeners and remove from panels array
```

#### `grafar.destroyPanel(panel)`
Global function to destroy a panel:
```javascript
grafar.destroyPanel(panel); // Same as panel.destroy()
```

## Usage

### Basic Usage
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

### Core Features
- **Debounced Updates**: 1ms debounce prevents flickering during resize
- **ResizeObserver API**: Modern container resize detection with polling fallback
- **Canvas Wrapper**: Isolates OrbitControls from container resize events
- **View Preservation**: Maintains camera position during resize
- **WebGL Integration**: Proper viewport and renderer size updates

### Browser Support
- All modern browsers with WebGL support
- ResizeObserver API with fallback for older browsers
- CSS `resize` property support

### Performance
- Minimal performance impact
- Only redraws when dimensions change
- Debounced updates prevent excessive redraws

## Testing

Test example available at `examples/resize_test.html`:
- Window resize handling
- Manual container resizing (drag corner)
- Programmatic size changes
- Fullscreen mode with close button
- Real-time size information