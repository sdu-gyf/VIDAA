# VIDAA - AI-Powered Video Generation Platform

VIDAA is a React-based web application that transforms articles into engaging videos automatically. This platform uses AI technology to analyze articles from RSS feeds and generate video content with appropriate titles, scripts, and visuals.

![VIDAA Application](https://placeholder-image-url.com/vidaa-screenshot.png)

## Features

- **RSS Integration**: Connect to various RSS sources to access articles for video generation
- **Article Selection**: Browse, preview, and select articles to transform into videos
- **AI-Powered Processing**: Generate video scripts, titles, and keyword suggestions automatically
- **Image Preview**: Visualize keywords with relevant images before generating videos
- **Customizable Output**: Edit generated titles and scripts to match your requirements

## Technology Stack

- React 18+ with TypeScript
- Vite as the build tool and development server
- React Router for navigation
- HeroUI component library (`@heroui/react`)
- Tailwind CSS for styling
- Event Source API for real-time processing feedback

## Project Structure

src/
├── components/              # Reusable UI components
│   ├── article/             # Article-related components
│   ├── common/              # Shared UI elements (errors, loading states)
│   ├── layout/              # Layout components
│   ├── rss/                 # RSS feed related components
│   └── video/               # Video generation components
├── constants/               # Application constants
├── contexts/                # React context providers
├── hooks/                   # Custom React hooks
├── pages/                   # Page components
├── services/                # Service layers for API interaction
├── styles/                  # CSS stylesheets
└── types/                   # TypeScript type definitions

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/VIDAA.git
   cd VIDAA/VIDAA-frontend
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn
   ```

3. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Backend Requirements

The application communicates with a backend server running at `http://127.0.0.1:8000`. Make sure the backend service is running with the following endpoints available:

- `/gen_video/rss_list` - Gets a list of available RSS sources
- `/gen_video/rss_content` - Fetches articles from a specific RSS source
- `/gen_video/dify` - Processes articles and generates video configurations
- `/gen_video/images` - Retrieves images for keywords

## Usage Flow

1. **Home Page**: View the application's features and navigate to the video generation page
2. **Select RSS Source**: Choose from available RSS feeds to browse articles
3. **Select Articles**: Preview and select articles you want to convert to videos
4. **Configure Videos**: For each selected article, generate and customize:
   - Video title options
   - Script content
   - Background image keywords
5. **Generate Videos**: Create videos with the configured settings

## Development

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally

### Environment Configuration

Modify the API endpoint configuration in `src/constants/api.ts` if your backend is running on a different address.

## Acknowledgements

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [HeroUI](https://heroui.dev/)
