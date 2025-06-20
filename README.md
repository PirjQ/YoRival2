# YoRival ⚔️

**Settle the Score. Share Your Take.**

YoRival is a modern debate platform where users can join rivalries, vote for their side, and generate AI-powered comeback lines to share with the world.

## Features

- 🗳️ **Vote on Debates** - Choose your side in ongoing rivalries
- 🤖 **AI Comeback Generator** - Generate witty one-liners to support your position
- 📱 **Share Your Take** - Download and share your comeback as an image
- 🔄 **Real-time Updates** - See vote counts update live
- 📊 **Smart Sorting** - Sort debates by most recent or most votes
- 🎨 **Beautiful UI** - Modern, responsive design with smooth animations

## Tech Stack

- **Frontend**: Next.js 13, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Deployment**: Netlify

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd yorival
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following main tables:

- **profiles** - User profiles with usernames
- **debates** - Debate topics with vote counts
- **votes** - User votes on debates
- **generated_smacks** - AI-generated comeback lines

## Deployment

This app is configured for static export and can be deployed to Netlify:

1. Build the application:
```bash
npm run build
```

2. Deploy the `out` directory to Netlify

3. Set environment variables in Netlify dashboard

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.

---

Built with ❤️ for healthy debates and witty comebacks!