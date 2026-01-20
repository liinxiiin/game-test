# **Space Pinball: Core Arena \- Developer Guide**

## **Architecture Overview**

This project follows a modular **ES6 Architecture** (ECMAScript Modules). The game logic is decoupled into specific domains to ensure high cohesion and low coupling, making the codebase easy to maintain and scale.

### **File Structure**

* **index.html**: The entry point. It defines the DOM structure, UI components (Tailwind CSS), and loads the entry script: \<script type="module" src="./js/main.js"\>\</script\>.  
* **js/ Directory**:  
  * **main.js**: **Composition Root**. Manages the requestAnimationFrame loop, handles top-level orchestration, and coordinates between modules.  
  * **state.js**: **Global State Manager**. A singleton object containing the "Single Source of Truth" for game data (score, inventory, entity arrays).  
  * **config.js**: **Configuration Constants**. Defines physics presets (gravity, speed), colors, and game settings.  
  * **physics.js**: **The Engine**. Handles collision detection (Circle-Circle, Circle-Rect) and integration of movement vectors.  
  * **entities.js**: **Factory Layer**. Responsible for spawning balls and initializing the complex orbital level layouts.  
  * **renderer.js**: **View Layer**. Contains all Canvas 2D drawing logic. It is strictly read-only regarding game state.  
  * **input.js**: **Interactions**. Manages keyboard and mouse/touch events to update input flags.  
  * **ui.js**: **HUD & DOM**. Updates text elements, manages the multiplier logic, and controls UI transitions.  
  * **utils.js**: **Utilities**. Math helpers and unit formatting.

## **Key Systems**

### **1\. Physics & Collision**

* **Collision Detection**: Uses specialized algorithms for Circle-to-Circle and Circle-to-Rotated-Rectangle (for the moving barriers).  
* **Perturbation**: To prevent "perfect loops" where a ball bounces infinitely in the same path, applyPerturbation() injects tiny random angle offsets upon every collision.

### **2\. The Multiplier Economy**

* The multiplier (1x, 2x, 4x...) acts as a high-stakes lever. It multiplies the cost of every shot but also multiplies every reward. Logic is centralized in ui.js.

### **3\. Modular Physics Presets**

* Planet modes (Earth, Moon, Comet) are data objects in config.js that are applied to the active physics state, changing gravity and speed dynamically.

## **Troubleshooting: Why is my screen blank?**

1. **Check the Console**: Press F12. If you see 404 Not Found for main.js, ensure your file is located at /js/main.js relative to index.html.  
2. **Local Server Required**: ES6 modules do not work with the file:// protocol. You must use **Live Server** (VS Code) or an equivalent HTTP server.  
3. **Correct File Selection**: Ensure you click "Go Live" while in the **Project Root Folder** workspace, not just inside the js/ subfolder.  
4. **Script Execution Order**: The script is marked as type="module", so it automatically defers execution until the HTML is parsed. Ensure your Canvas ID gameCanvas is correct.

## **Local Development**

* **Recommended**: Use **VS Code Live Server**.  
* **Alternative**: Use Python (python \-m http.server) or Node.js (npx http-server) in the directory containing index.html.