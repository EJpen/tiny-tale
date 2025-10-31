# 👶 Tiny Tale - Interactive Gender Reveal Voting App

A modern, real-time gender reveal voting application built with Next.js that allows friends and family to guess the baby's gender before the big reveal!

## ✨ Introduction

Tiny Tale is an interactive web application designed to make gender reveal parties more engaging and fun. Guests can vote on whether they think the baby will be a boy or girl, see real-time voting statistics, and experience an exciting animated reveal moment complete with countdown, confetti, and winner selection.

## 📋 Description

### Main Features

- **🗳️ Real-time Voting System**: Guests can vote for "Boy" or "Girl" with live updates
- **📊 Dynamic Progress Bar**: Visual representation of voting percentages between teams
- **🎭 Animated Gender Reveal**: Dramatic countdown with flickering backgrounds and confetti
- **🎰 Winner Roulette**: Host can select winners from correct guessers
- **🔐 PIN-Protected Host Controls**: Secure access to host-only features
- **📱 QR Code Sharing**: Easy room sharing via QR codes
- **⚡ Real-time Updates**: Powered by Pusher for instant vote synchronization
- **🎨 Beautiful UI**: Modern design with smooth animations using Framer Motion

### Key Functionality

- **Room Creation**: Hosts create private voting rooms with custom names
- **Vote Management**: Hosts can close/reopen voting and manage individual votes
- **Gender Reveal**: Cinematic reveal experience with customizable animations
- **Winner Selection**: Interactive roulette to pick winners from correct votes
- **Mobile Responsive**: Works seamlessly on all devices

## 🚀 How to Use

### For Hosts (Room Creators)

1. **Create a Room**: Enter a room name on the homepage
2. **Share with Guests**: Show the QR code or share the room link
3. **Monitor Voting**: Watch real-time vote counts and progress
4. **Manage Voting**: Use "Host Access" button with your PIN to:
   - Close/reopen voting
   - Delete individual votes
   - Reveal the gender with dramatic animation
   - Run the winner roulette

### For Guests (Voters)

1. **Join a Room**: Scan QR code or visit the shared link
2. **Cast Your Vote**: Choose "Boy" or "Girl" by entering your name
3. **Watch Live Updates**: See voting progress update in real-time
4. **Enjoy the Reveal**: Experience the countdown and gender reveal
5. **Winner Selection**: See if you're selected in the roulette (if you guessed correctly)

## 🎯 Tech Stack
### Frontend: 
- Next.js 14, React, TypeScript, Tailwind
### Backend: 
- Next.js API Routes, Prisma ORM
### Database: 
- PostgreSQL
### Real-time: 
- Pusher WebSockets
### Animations: 
- Framer Motion
### Styling: 
- Tailwind CSS + shadcn/ui components
### Icons: 
- Lucide React

## ⚙️ Setup & Installation Guide

### Prerequisites

- **Node.js** (v18 or higher)
- **Bun** (recommended) or npm/yarn
- **PostgreSQL** database (local or cloud-based like Supabase)
- **Pusher** account for real-time features

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/tiny-tale.git
cd tiny-tale
```

### Step 2: Install Dependencies

```bash
bun install
```

### Step 3: Environment Configuration
Copy the environment template
```bash
cp .env.example .env
```
Edit the .env file with your configuration
```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/tinytale"

# Pusher Configuration (Real-time features)
PUSHER_APP_ID="your_pusher_app_id"
NEXT_PUBLIC_PUSHER_KEY="your_pusher_key"
PUSHER_SECRET="your_pusher_secret"
NEXT_PUBLIC_PUSHER_CLUSTER="your_pusher_cluster"

# Application Configuration
APP_ENV="development"
APP_URL="http://localhost:3000"
PORT=3000
```

### Step 4: Database Setup

```bash
# Generate Prisma client
bunx prisma generate

# Run database migrations
bunx prisma migrate dev

# (Optional) Seed the database
bunx prisma db seed
```

### Step 5: Configure Pusher
1. Create a free account at pusher.com
2. Create a new app in your Pusher dashboard
3. Copy the app credentials to your `.env` file:
- App ID
- Key (starts with NEXT_PUBLIC_)
- Secret
- Cluster

### Step 6: Start Development Server
```bash
bun dev
```

The application will be available at `http://localhost:3000`


### 🛠️ Additional Commands
```bash
# Build for production
bun run build

# Start production server
bun start

# View database in Prisma Studio
bunx prisma studio

# Reset database
bunx prisma migrate reset
```

## 📚 Learn More
To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial
- [Prisma Documentation](https://www.prisma.io/docs) - database toolkit and ORM
- [Pusher Documentation](https://pusher.com/docs) - real-time features
- [Tailwind CSS](https://tailwindcss.com/docs) - utility-first CSS framework

<u>Made with ❤️ for memorable gender reveal moments!</u>