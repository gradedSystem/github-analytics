# GitHub Analytics

A dashboard for visualizing GitHub repository data and activity.

## Features

- Repository statistics and metrics
- Activity timeline
- Commit history visualization
- Issue tracking
- GitHub Actions workflow monitoring

## Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/github-analytics.git
   cd github-analytics
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   - Copy `.env.example` to `.env.local`
   ```bash
   cp .env.example .env.local
   ```
   - Edit `.env.local` and add your GitHub token

4. Run the development server
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

- `GITHUB_TOKEN`: A GitHub personal access token with repo scope
- `NEXT_PUBLIC_SOCKET_URL`: URL for WebSocket connection (only needed if using real-time features)

## Deployment on Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add the environment variables in the Vercel project settings
4. Deploy!

## Technologies Used

- Next.js
- Material UI
- Recharts
- Tailwind CSS
- GitHub APIThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
