# EnergyMatch Platform

A comprehensive renewable energy planner and marketplace for SMEs and homeowners in Colombia, powered by Google Gemini AI.

## 🚀 Local Development Setup

This project runs on your local machine. Follow these steps to get started.

### Prerequisites
- Node.js 18+ (for frontend)
- Python 3.10+ (for backend)
- Google Gemini API Key - Get one from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd energymatch
   ```

2. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env and add your API_KEY
   npm run dev
   ```

3. **Setup Backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env if needed
   ```

## 📦 Project Structure

```
energymatch/
├── frontend/          # Vite + React + TypeScript
│   ├── components/    # React components
│   ├── services/      # API services (Gemini integration)
│   └── vercel.json    # Frontend deployment config
├── backend/           # FastAPI + Python
│   ├── api/           # API routes
│   ├── schemas/       # Pydantic models
│   ├── services/      # Business logic
│   └── vercel.json    # Backend deployment config
└── vercel.json        # Root monorepo config
```

## 🌐 Deployment to Vercel (Optional)

If you want to deploy this project to production, you can use Vercel.

### Environment Variables

**Frontend:**
- `API_KEY` - Your Google Gemini API key from [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (required)
- `N8N_WEBHOOK_URL` - N8N webhook for lead notifications (optional)

**Backend:**
- `N8N_WEBHOOK_URL` - N8N webhook for lead notifications (optional)

### Deploy Steps

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables** in Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add `API_KEY` with your Gemini API key
   - Add `N8N_WEBHOOK_URL` if using N8N integration

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## 🔧 Features

- **AI-Powered Analysis**: Uses Google Gemini to analyze energy bills and generate recommendations
- **Smart Recommendations**: Calculates optimal solar panel systems based on consumption
- **Energy Coach**: Interactive AI assistant for energy questions
- **Provider Marketplace**: Connect with verified renewable energy providers
- **Multi-Role Support**: Client, Provider, and Admin dashboards
- **Geolocation**: Automatic location detection for accurate solar calculations

## 📝 Tech Stack

**Frontend:**
- React 19
- TypeScript
- Vite
- TailwindCSS
- Google Gemini AI
- Recharts

**Backend:**
- FastAPI
- Python 3.10
- Pydantic
- Mangum (for serverless)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues or questions, please open an issue on GitHub.
