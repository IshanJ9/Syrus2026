# GemForge — AI Jewelry Studio

> Upload a 2D jewelry photo and get a real-time 3D model you can customize, preview, and export.

Built for **Syrus 2026 Hackathon**.

---

## What It Does

1. **Upload** a photo of any jewelry piece (bracelet, ring, or pendant)
2. **AI analyzes** the image — detects type, metal, stones, style, and motif using Gemini 2.5 Flash
3. **3D model generated** via Hugging Face Spaces (`frogleo/Image-to-3D`, Hunyuan-based)
4. **Customize in real-time** — swap metals, stones, styles, finishes, and gem sizes in a live 3D viewport
5. **Export** your design as GLB or OBJ

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), React Three Fiber, Three.js, Zustand, Tailwind CSS |
| **Backend** | FastAPI, Pydantic v2, Python 3.11+ |
| **AI Analysis** | Google Gemini 2.5 Flash (`google-genai` SDK) |
| **3D Generation** | Hugging Face Spaces — `frogleo/Image-to-3D` via `gradio_client` |
| **Mesh Processing** | trimesh (OBJ to GLB conversion) |

---

## Supported Jewelry Types

### Bracelets
Tennis, Bangle, Cuff, Chain, Beaded

### Rings
Solitaire, Halo, Three Stone, Band, Pave

### Pendants
Drop, Heart, Cross, Charm, Locket

### Gemstones
Diamond (brilliant-cut) | Ruby, Emerald, Sapphire, Amethyst, Topaz (cabochon) | Opal (iridescent cabochon) | Pearl (sheen)

### Metals
Yellow Gold, White Gold, Rose Gold, Silver, Platinum

### Finishes
Polished, Matte, Brushed, Hammered

---

## Project Structure

```
jewelry-mvp-bracelet/
├── backend/
│   ├── app/
│   │   ├── main.py                   # FastAPI app, routes, image serving
│   │   ├── api/
│   │   │   └── customize.py          # PUT /api/customize endpoint
│   │   ├── schemas/
│   │   │   └── jewelry.py            # Pydantic models & enums
│   │   └── services/
│   │       ├── image_analyzer.py     # Gemini-powered image analysis
│   │       ├── design_generator.py   # Design builder with per-type defaults
│   │       ├── mesh_generator.py     # HF Spaces 3D mesh generation
│   │       └── pricing_engine.py     # Multi-type pricing calculator
│   ├── requirements.txt
│   └── .env                          # API keys (gitignored)
│
└── frontend/
    ├── app/                          # Next.js App Router pages
    ├── components/
    │   ├── JewelryScene.tsx          # Top-level 3D dispatcher (bracelet/ring/pendant)
    │   ├── ViewerPanel.tsx           # Canvas + HUD overlays
    │   ├── UploadPanel.tsx           # Image upload with drag & drop
    │   ├── CustomizationPanel.tsx    # Type/style/metal/stone/finish controls
    │   ├── ExportPanel.tsx           # GLB/OBJ download + design info
    │   ├── BandMesh.tsx              # Procedural bracelet bands
    │   ├── RingMesh.tsx              # Procedural ring styles (5 variants)
    │   ├── PendantMesh.tsx           # Procedural pendant styles (5 variants)
    │   ├── GemMesh.tsx               # Gem renderers (brilliant, cabochon, pearl)
    │   ├── StoneMesh.tsx             # Per-type stone placement logic
    │   ├── TexturedBracelet.tsx      # Photo-texture on bracelet geometry
    │   ├── TexturedRing.tsx          # Photo-texture on ring geometry
    │   ├── TexturedPendant.tsx       # Photo-texture on pendant geometry
    │   ├── GeneratedMeshViewer.tsx   # AI-generated GLB model viewer
    │   ├── materialPresets.ts        # Metal & stone color/material maps
    │   ├── MotifMesh.tsx             # Decorative motif overlays
    │   └── ClaspMesh.tsx             # Bracelet clasp
    ├── store/
    │   └── useJewelryStore.ts        # Zustand global state
    ├── lib/
    │   └── api.ts                    # Backend API client
    ├── types/
    │   └── jewelry.ts                # TypeScript type definitions
    └── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **Python** 3.11+
- **API Keys:**
  - [Google AI Studio](https://aistudio.google.com/) — Gemini API key
  - [Hugging Face](https://huggingface.co/settings/tokens) — HF access token

### 1. Backend Setup

```bash
cd jewelry-mvp-bracelet/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Linux/Mac
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your keys:
#   GEMINI_API_KEY=your_gemini_key
#   HF_TOKEN=your_hf_token
#   STORAGE_PATH=./storage

# Run the server
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd jewelry-mvp-bracelet/frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload jewelry image for analysis |
| PUT | `/api/customize` | Update design parameters |
| GET | `/api/image/{design_id}` | Serve uploaded source image |
| GET | `/api/export/{design_id}/{format}` | Download mesh (glb/obj) |
| GET | `/api/price/{design_id}` | Get price breakdown |

---

## Rendering Pipeline

The 3D viewer uses a **three-tier rendering priority**:

1. **AI Mesh** — If `frogleo/Image-to-3D` returns a GLB, display it (toggle on/off)
2. **Image Texture** — Uploaded photo mapped onto type-appropriate geometry as a textured preview
3. **Procedural** — Fully parametric 3D model built from detected/customized properties

All three tiers respond to the jewelry type dispatcher — switching between bracelet, ring, and pendant renders seamlessly.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key for image analysis |
| `HF_TOKEN` | Hugging Face token for `frogleo/Image-to-3D` |
| `STORAGE_PATH` | Local directory for uploads and generated meshes (default: `./storage`) |

---

## License

Built for Syrus 2026 Hackathon.
