# 🎬 Full Stack Video Rendering Application

A modern full stack web application for **video rendering, uploading, and downloading** with smooth animations and cloud storage.

Built with **Next.js, ImageKit, MongoDB, and Framer Motion**, it provides a production-ready platform for handling videos with authentication and optimized performance.

---

## 🚀 Features

- 🔐 **Authentication**: Secure user authentication with [NextAuth](https://next-auth.js.org/).
- 🎥 **Video Rendering**: Smooth and interactive video rendering powered by [Framer Motion](https://www.framer.com/motion/).
- ⬆️ **Video Upload**: Upload videos directly to [ImageKit](https://imagekit.io/) for fast, global delivery.
- ⬇️ **Video Download**: Secure and optimized video downloads from ImageKit.
- 🗄️ **Database**: User and video metadata stored in [MongoDB](https://www.mongodb.com/).

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/), [Framer Motion](https://www.framer.com/motion/)
- **Authentication**: [NextAuth](https://next-auth.js.org/)
- **Storage & Media Optimization**: [ImageKit](https://imagekit.io/)
- **Database**: [MongoDB](https://www.mongodb.com/)
- **Deployment**: [Vercel](https://vercel.com/) (recommended)

---

## 📂 Project Structure

``` bash
.
├── components/ # Reusable React components
├── pages/ # Next.js pages & API routes
├── lib/ # Database connection, auth, and helper utilities
├── public/ # Static assets
├── styles/ # Global and module CSS
├── package.json # Dependencies & scripts
└── README.md

```

## ⚙️ Installation & Setup

### 1. Clone the repository

``` bash
git clone https://github.com/your-username/render-nest.git
cd render-nest
```

### 2. Install dependencies with Yarn or NPM

``` bash
yarn install
# or
npm install
```

### 3. Set up environment variables (.env)  (optional)

``` bash    
cp .env.example .env
```

### 4. Start the development server

``` bash
yarn dev
# or
npm run dev
```

### 5. Build for production

``` bash
yarn build
# or    
npm run build
```

### 6. Deploy to Vercel

``` bash
vercel deploy
```

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---