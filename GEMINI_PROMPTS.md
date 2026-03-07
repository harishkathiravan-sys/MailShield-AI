# 🎬 Gemini Video Generation Prompts

Use these prompts with **Gemini** or **Google Veo** to generate your cybersecurity animation video.

---

## 🎯 Option 1: Cinematic Journey (Recommended)

```
Create a 10-second cinematic video showing a journey through a cybersecurity defense network for an email security platform called "MailShield AI":

CAMERA MOVEMENT:
- Start: Wide establishing shot, camera far away
- End: Close-up dramatic reveal
- Motion: Smooth forward dolly/zoom
- Speed: Slow and steady, builds intensity

SCENE DESCRIPTION:

Beginning (0-3 seconds):
- Dark cyber space environment
- Floating suspicious email envelopes in the distance
- Blue/cyan holographic grid lines
- Data streams flowing vertically
- Particles floating slowly
- Mysterious, calm atmosphere

Middle (3-7 seconds):
- Camera accelerates toward central area
- Email envelopes getting larger
- Color transition from cyan to purple
- Scanning beams appear
- Network nodes lighting up
- Warning indicators starting to appear
- Intensity building

End (7-10 seconds):
- Camera very close to MailShield AI shield/logo
- Red warning alerts and threat indicators
- Intense particle effects
- Threat visualization (red highlights)
- Dramatic reveal of protection system
- High contrast, focused composition

VISUAL STYLE:
- Color palette: Cyan → Purple → Red gradient
- Lighting: Dramatic, high contrast
- Mood: Dark, futuristic, high-tech
- Quality: Cinematic, professional
- Effects: Particles, light trails, holographic elements

TECHNICAL SPECS:
- Resolution: 1920x1080 (Full HD)
- Frame rate: 30fps
- Duration: 10 seconds
- No text or UI elements
```

---

## 🌊 Option 2: Abstract Data Flow

```
Create a 8-second abstract visualization of email security analysis:

Start with swirling data streams representing incoming emails (blue), 
gradually revealing a central AI system (purple glow), 
ending with threats being isolated and contained (red particles trapped in force fields).

Style: Abstract, futuristic, particle-based
Colors: Blue → Purple → Red
Motion: Flowing, organic, building intensity
Lighting: Neon glow effects
Camera: Slow zoom into the center
```

---

## 🛡️ Option 3: Shield Formation

```
Cyber security animation, 10 seconds:

Opening: Scattered digital fragments and threat indicators in dark space
Middle: Fragments coalescing and organizing into geometric patterns
Finale: MailShield AI protective shield fully formed, glowing, deflecting threats

Aesthetic: Dark sci-fi, holographic elements, Matrix-inspired
Color scheme: Cyan data → Purple analysis → Red threat detection
Camera: Orbiting spiral inward, ending centered on shield
```

---

## 🔬 Option 4: Microscopic to Macro

```
Create a zoom-out journey from microscopic email data to full network view:

Start: Extreme close-up of digital "DNA" strands (email code/data)
Middle: Pull back to reveal network connections between threats
End: Wide shot showing entire MailShield AI defense system protecting multiple emails

Duration: 10 seconds
Style: Scientific visualization meets cybersecurity
Colors: Cool blues transitioning to warm reds (safe to danger)
Effects: Depth of field, particle systems, network lines
```

---

## 🎨 Option 5: Threat Neutralization

```
Dramatic 8-second sequence showing email threat detection and neutralization:

Scene 1 (0-3s): Suspicious email icon glowing red, surrounded by malicious code
Scene 2 (3-5s): MailShield AI scanning beams analyze the threat (blue lasers)
Scene 3 (5-8s): Threat contained in purple energy field, then destroyed with particle explosion

Camera: Dramatic rotating angles, ends with powerful frontal view
Lighting: High contrast, neon accents
Mood: Action-packed, protective, powerful
```

---

## 💡 Tips for Best Results

### For Gemini/Veo:

1. **Be specific about camera movement** - "dolly forward" vs just "zoom"
2. **Specify color transitions** explicitly with timing
3. **Request "cinematic" and "professional" quality**
4. **Avoid text/UI** - pure visual storytelling
5. **Keep it 8-12 seconds** (sweet spot for frame count)

### Prompt Structure Template:
```
[DURATION] + [CAMERA MOVEMENT] + [SCENE DESCRIPTION] + 
[COLOR PALETTE] + [VISUAL STYLE] + [MOOD/ATMOSPHERE]
```

### Keywords That Work Well:
- "Cinematic"
- "Holographic"
- "Particle effects"
- "High contrast"
- "Neon glow"
- "Cyberpunk aesthetic"
- "Matrix-inspired"
- "Tron-like"
- "Dark sci-fi"

---

## 🎬 After Generation

Once you have your video:

### 1. Download the video
```
Right-click → Save As → mailshield-animation.mp4
```

### 2. Extract frames (PowerShell/Terminal)
```bash
# Install FFmpeg first: choco install ffmpeg

# Extract 120 frames
ffmpeg -i mailshield-animation.mp4 -vf "fps=120/10" -start_number 1 "frame-%04d.jpg"
```

### 3. Copy to project
```powershell
Move-Item frame-*.jpg D:\MailShield-AI\frontend\public\frames\
```

### 4. Test
```
Visit http://localhost:5173
Scroll slowly to see your cinematic animation!
```

---

## 🚀 Iteration Tips

If the first video isn't perfect:

**Too Fast/Slow:**
- Adjust "duration" in prompt
- More frames = smoother (60-240 range)

**Wrong Colors:**
- Be more specific: "Cyan (#00D4FF) → Purple (#9333EA) → Red (#EF4444)"
- Reference hex codes

**Camera Too Aggressive:**
- Use words like "gentle", "smooth", "steady"
- Specify "slow dolly forward" instead of "fast zoom"

**Not Cybersecurity Themed Enough:**
- Add keywords: "shield", "firewall", "network", "encryption", "threat"
- Reference "cyber defense visualization"

---

## 📋 Checklist

- [ ] Generate video with Gemini using prompt above
- [ ] Download video file
- [ ] Install FFmpeg (`choco install ffmpeg`)
- [ ] Extract frames to get 120 JPG files
- [ ] Copy frames to `/public/frames/` directory
- [ ] Refresh browser at localhost:5173
- [ ] Scroll to test animation
- [ ] Adjust `SMOOTHING` value if needed

---

**Need help?** See [FRAME_ANIMATION_GUIDE.md](./FRAME_ANIMATION_GUIDE.md) for full documentation!
