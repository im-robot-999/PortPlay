# PortPlay Assets

This directory contains game assets for PortPlay. In production, these would be served from a CDN.

## Asset Pipeline

### 3D Models (GLTF/GLB)
- **Source**: Blender/FBX files in `source/` directory
- **Export**: GLTF/GLB format with embedded textures
- **Optimization**: Draco compression for geometry, KTX2/Basis for textures
- **LOD**: Multiple Level of Detail versions for performance

### Textures
- **Format**: KTX2/Basis for web optimization
- **Compression**: Basis Universal for cross-platform compatibility
- **Mipmaps**: Generated for all texture sizes
- **Channels**: RGB, RGBA, Normal maps, PBR materials

### Audio
- **Format**: OGG Vorbis for web compatibility
- **Compression**: Variable bitrate based on content type
- **Streaming**: Chunked loading for large audio files

## Directory Structure

```
assets/
├── models/           # 3D models (GLTF/GLB)
│   ├── characters/   # Player and NPC models
│   ├── environments/ # Level geometry
│   ├── props/        # Interactive objects
│   └── ui/          # UI elements
├── textures/         # 2D textures
│   ├── characters/   # Character textures
│   ├── environments/ # Environment textures
│   ├── props/        # Object textures
│   └── ui/          # UI textures
├── audio/            # Sound effects and music
│   ├── sfx/         # Sound effects
│   ├── music/       # Background music
│   └── voice/       # Voice lines
├── source/           # Source files (Blender, Photoshop, etc.)
└── exports/          # Processed assets ready for use
```

## Asset Guidelines

### 3D Models
- **Polygon Count**: Keep under 10k for main characters, 5k for props
- **Textures**: 1024x1024 max for characters, 512x512 for props
- **LODs**: 3 levels (high, medium, low)
- **Optimization**: Remove unused vertices, optimize UV layouts

### Textures
- **Resolution**: Power of 2 (256, 512, 1024, 2048)
- **Format**: KTX2 for best compression, PNG for transparency
- **Compression**: Use appropriate quality settings for each asset type

### Audio
- **Sample Rate**: 44.1kHz for music, 22.05kHz for SFX
- **Bitrate**: 128kbps for music, 64kbps for SFX
- **Duration**: Keep SFX under 3 seconds, music loops under 2 minutes

## Build Process

1. **Source Processing**: Convert source files to optimized formats
2. **Texture Compression**: Apply KTX2/Basis compression
3. **Model Optimization**: Generate LODs and apply Draco compression
4. **Audio Processing**: Convert to OGG and apply compression
5. **Validation**: Check all assets meet quality standards
6. **Upload**: Deploy to CDN with proper caching headers

## Performance Considerations

- **Bundle Size**: Keep total asset size under 50MB for initial load
- **Streaming**: Load non-critical assets asynchronously
- **Caching**: Use appropriate cache headers for different asset types
- **Compression**: Enable gzip/brotli compression on CDN

## Development Assets

For development, placeholder assets are included:
- Basic geometry shapes
- Simple textures
- Placeholder audio files

Replace these with production assets before deployment.

## Asset Versioning

Assets are versioned using semantic versioning:
- **Major**: Breaking changes (incompatible formats)
- **Minor**: New features (new asset types)
- **Patch**: Bug fixes and optimizations

## License

All assets are either:
- Original work by the PortPlay team
- Licensed from third-party providers
- Creative Commons licensed

See individual asset files for specific licensing information.
