# Spline Integration Guide for MailShield AI

This guide explains how to replace the current CSS animated background with your custom Spline 3D scene.

---

## Prerequisites

✅ **Spline React library is already installed** in the project:
```bash
@splinetool/react-spline
```

---

## Step 1: Create Your Spline Scene

1. Go to **https://spline.design**
2. Sign up or log in
3. Create a new project
4. Design your **cybersecurity 3D environment**

### Recommended Elements for MailShield AI Theme:

**Core Elements:**
- 🔷 Floating glowing email envelopes (slowly drifting)
- 🌐 Network nodes connected by thin neon lines
- 🔒 Shield and lock symbols (glowing, semi-transparent)
- 📦 Semi-transparent cubes (representing sandbox environments)
- 🔴 Blinking red spheres (threat indicators)

**Atmosphere:**
- Dark background (deep navy/black)
- Neon accents: cyan (#00d4ff), purple (#b47eff), red (#ff3366)
- Subtle ambient lighting
- Slow, calm animations

**Camera Behavior:**
- Enable scroll-based camera movement if Spline supports it
- Or set a slow auto-rotation for subtle depth

---

## Step 2: Export Your Spline Scene

1. In Spline editor, click **Export** button (top right)
2. Choose **"Get Embed Code"** or **"Copy Link"**
3. You'll get a URL like:
   ```
   https://prod.spline.design/YOUR_UNIQUE_ID/scene.splinecode
   ```
4. **Copy this URL** - you'll need it for integration

---

## Step 3: Integrate Spline into MailShield AI

### Option A: Quick Integration (Recommended)

Open this file:
```
frontend/src/components/background/CyberBackground.jsx
```

**Uncomment the Spline import** at the top:
```jsx
import Spline from '@splinetool/react-spline';
```

**Replace the entire return statement** with:
```jsx
return (
  <div className="fixed inset-0 -z-10 overflow-hidden">
    <Spline scene="YOUR_SPLINE_SCENE_URL_HERE" />
    
    {/* Optional: Keep gradient overlay for UI readability */}
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cyber-darker/90 pointer-events-none" />
  </div>
);
```

**Replace `YOUR_SPLINE_SCENE_URL_HERE`** with your actual Spline scene URL.

### Option B: Side-by-Side Comparison

If you want to test Spline without removing the CSS background, create a new component:

File: `frontend/src/components/background/SplineBackground.jsx`
```jsx
import Spline from '@splinetool/react-spline';

export default function SplineBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <Spline 
        scene="YOUR_SPLINE_SCENE_URL_HERE"
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* Gradient overlay for content readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cyber-darker/80 pointer-events-none" />
    </div>
  );
}
```

Then in `App.jsx`, switch between backgrounds:
```jsx
// import CyberBackground from './components/background/CyberBackground'; // CSS version
import SplineBackground from './components/background/SplineBackground'; // Spline version

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-cyber-darker">
        {/* <CyberBackground /> */}
        <SplineBackground />
        <Navbar />
        {/* ... rest of the app */}
      </div>
    </Router>
  );
}
```

---

## Step 4: Optimize Performance

### Loading States

Add a loading fallback while Spline loads:

```jsx
import Spline from '@splinetool/react-spline';
import { useState } from 'react';

export default function SplineBackground() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {loading && (
        <div className="absolute inset-0 bg-cyber-darker flex items-center justify-center">
          <div className="text-cyan-400 animate-pulse">Loading 3D Environment...</div>
        </div>
      )}
      
      <Spline 
        scene="YOUR_SPLINE_SCENE_URL"
        onLoad={() => setLoading(false)}
      />
    </div>
  );
}
```

### Mobile Optimization

Disable Spline on mobile for better performance:

```jsx
import Spline from '@splinetool/react-spline';
import { useEffect, useState } from 'react';
import CyberBackground from './CyberBackground'; // CSS fallback

export default function AdaptiveBackground() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Use CSS background on mobile, Spline on desktop
  if (isMobile) {
    return <CyberBackground />;
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <Spline scene="YOUR_SPLINE_SCENE_URL" />
    </div>
  );
}
```

---

## Step 5: Test and Adjust

1. **Refresh your browser** at http://localhost:5173
2. Check that the Spline scene loads correctly
3. Verify UI elements are readable over the 3D background
4. Test scrolling behavior
5. Check performance (aim for 60fps)

### Troubleshooting

**Problem: Spline scene is too bright**
- Add darker overlay gradient (increase opacity)

**Problem: Spline scene is too distracting**
- Reduce animation speed in Spline editor
- Increase blur on background elements
- Add stronger gradient overlays

**Problem: Performance issues**
- Reduce polygon count in Spline
- Disable shadows and reflections
- Use mobile fallback for low-end devices

**Problem: Scene not loading**
- Verify the Spline URL is correct
- Check browser console for errors
- Ensure Spline scene is published (not private)

---

## Current Status

✅ **Spline React library installed**
✅ **CSS animated background active** (fallback)
✅ **Code prepared for easy Spline integration**
⏳ **Waiting for your Spline scene URL**

---

## Design Tips for Your Spline Scene

### Color Palette (Match MailShield AI)
- Background: `#020617` (deep navy)
- Primary: `#00d4ff` (cyan)
- Secondary: `#b47eff` (purple)
- Accent: `#00ff94` (neon green)
- Danger: `#ff3366` (red)

### Animation Guidelines
- **Keep it subtle**: Slow, calm movements
- **No sudden changes**: Gentle rotations and drifts
- **Consistent theme**: Cybersecurity/network monitoring
- **Performance first**: Optimize for 60fps on mid-range devices

### Camera Settings
- **Position**: Slightly elevated, looking down at network
- **FOV**: 60-75 degrees for comfortable viewing
- **Movement**: Very slow if animated (3-5 second cycles)

---

## Need Help?

If you encounter issues integrating Spline:

1. Check the Spline documentation: https://docs.spline.design
2. Verify your scene is published and accessible
3. Test the Spline URL in a separate HTML file first
4. Check browser console for specific error messages

---

**When you're ready to integrate, just:**
1. Share your Spline scene URL
2. I'll integrate it into the code
3. We'll test and optimize together!
