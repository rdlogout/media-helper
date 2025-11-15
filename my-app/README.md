# Video Thumbnail Extractor for Fastly Compute

A Fastly Compute application that extracts thumbnails from videos using a server-side approach. Since FFmpeg.wasm has compatibility issues with the Fastly Compute environment, this implementation provides a robust foundation with placeholder functionality and clear integration paths for production video processing.

## 🚀 Features

- **Video URL Processing**: Download and analyze videos from remote URLs
- **Thumbnail Extraction**: Extract thumbnails at specified timestamps
- **Video Metadata**: Get video information (size, format, etc.)
- **Backend Service Integration**: Forward to external video processing services
- **Health Monitoring**: Built-in health check endpoint
- **Error Handling**: Comprehensive error handling and validation

## 📋 API Endpoints

### 1. Extract Video Thumbnail
```
GET /video?url=<video_url>&timestamp=<time>&width=<width>&height=<height>
```

**Parameters:**
- `url` (required): Video URL to process
- `timestamp` (optional): Time position for thumbnail (default: "00:00:01")
- `width` (optional): Thumbnail width in pixels
- `height` (optional): Thumbnail height in pixels

**Example:**
```bash
curl "http://localhost:7676/video?url=https://example.com/video.mp4&timestamp=00:00:05&width=320&height=240"
```

### 2. Get Video Information
```
GET /video/info?url=<video_url>
```

**Parameters:**
- `url` (required): Video URL to analyze

**Example:**
```bash
curl "http://localhost:7676/video/info?url=https://example.com/video.mp4"
```

### 3. Advanced Processing (Backend Service)
```
POST /video/process
```

**Request Body:**
```json
{
  "videoUrl": "https://example.com/video.mp4",
  "serviceUrl": "https://your-video-processing-service.com/api/thumbnail",
  "options": {
    "timestamp": "00:00:05",
    "format": "jpeg",
    "width": 320,
    "height": 240
  }
}
```

### 4. Health Check
```
GET /health
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 16+ 
- Fastly CLI
- Fastly Compute service account

### Installation
```bash
# Clone or create the project
npm install

# Build the application
npm run build

# Run locally
npm run start
```

### Local Testing
The application runs on `http://localhost:7676` by default.

## 🏗️ Architecture

### Current Implementation
Since FFmpeg.wasm has compatibility issues with Fastly Compute's WebAssembly environment, the current implementation provides:

1. **Placeholder Thumbnails**: SVG-based placeholder images with video metadata
2. **Video Analysis**: HTTP HEAD requests to gather video metadata
3. **Error Handling**: Comprehensive validation and error responses
4. **Backend Integration**: Ready-to-use forwarding to external services

### Production Recommendations

For actual video thumbnail extraction in production, consider these approaches:

#### Option 1: Backend Video Processing Service
Set up a backend service with FFmpeg capabilities:

```typescript
// Example backend service integration
const result = await forwardToProcessingService(
  videoUrl, 
  'https://your-ffmpeg-service.com/api/extract-thumbnail'
);
```

#### Option 2: Cloud Video Processing APIs
Use services like:
- **Transloadit**: `/video/thumbs` robot with parallel extraction
- **Cloudinary**: Video transformation and thumbnail extraction
- **AWS Elemental MediaConvert**: Professional video processing
- **Google Cloud Video Intelligence**: AI-powered video analysis

#### Option 3: Fastly Media Shield
Use Fastly's Media Shield with custom VCL for video processing at the edge.

## 🔧 Configuration

### Environment Variables
```bash
# Backend service URL for video processing
VIDEO_PROCESSING_SERVICE_URL=https://your-service.com/api

# Default thumbnail settings
DEFAULT_THUMBNAIL_WIDTH=320
DEFAULT_THUMBNAIL_HEIGHT=240
DEFAULT_TIMESTAMP=00:00:01
```

### Fastly Configuration
Update `fastly.toml` with your service configuration:
```toml
[local_server]
  [local_server.backends]
    [local_server.backends.video_processing]
      url = "https://your-video-service.com"
```

## 📊 Sample Video URLs for Testing

- **Big Buck Bunny**: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`
- **Elephants Dream**: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4`
- **For Bigger Blazes**: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4`

## 🧪 Testing

### Unit Tests
```bash
# Run tests (if implemented)
npm test
```

### Manual Testing
Use the included `test.html` file for browser-based testing:
```bash
# Open in browser
open test.html
```

### API Testing
```bash
# Test health endpoint
curl http://localhost:7676/health

# Test video info
curl "http://localhost:7676/video/info?url=<video_url>"

# Test thumbnail extraction
curl "http://localhost:7676/video?url=<video_url>&timestamp=00:00:05"
```

## 🚀 Deployment

### Fastly Compute Deployment
```bash
# Deploy to Fastly
npm run deploy

# Or use Fastly CLI directly
fastly compute publish
```

### Build Configuration
The application builds to `bin/main.wasm` using the Fastly Compute toolchain.

## 🔍 FFmpeg.wasm Compatibility Issues

### Why FFmpeg.wasm Doesn't Work in Fastly Compute

1. **SharedArrayBuffer Requirements**: FFmpeg.wasm requires `SharedArrayBuffer` which needs specific CORS headers
2. **Web Workers**: Fastly Compute doesn't support Web Workers in the same way browsers do
3. **Memory Constraints**: Large video files exceed typical edge computing memory limits
4. **Threading**: WebAssembly threading support is limited in serverless environments

### Alternative Approaches

Instead of FFmpeg.wasm, consider:
- Server-side FFmpeg with Node.js/Python/Go
- Cloud-based video processing APIs
- Edge-optimized video processing services
- Progressive enhancement with client-side processing as fallback

## 📈 Performance Considerations

### Current Implementation
- **Lightweight**: No heavy video processing at the edge
- **Fast Response**: Placeholder generation is instant
- **Scalable**: Minimal resource usage

### Production Optimization
- **Caching**: Cache video metadata and thumbnails
- **CDN Integration**: Use Fastly's caching for processed results
- **Async Processing**: Queue large videos for background processing
- **Rate Limiting**: Implement rate limiting for video processing endpoints

## 🔒 Security Considerations

- **URL Validation**: All video URLs are validated before processing
- **Error Sanitization**: Error messages don't expose internal details
- **Rate Limiting**: Implement rate limiting to prevent abuse
- **HTTPS Only**: Ensure all video URLs use HTTPS

## 📚 Further Reading

- [Fastly Compute Documentation](https://developer.fastly.com/learning/compute/)
- [FFmpeg.wasm GitHub](https://github.com/ffmpegwasm/ffmpeg.wasm)
- [Transloadit Video Processing](https://transloadit.com/docs/video-thumbs/)
- [WebAssembly Server-Side Processing](https://webassembly.org/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
