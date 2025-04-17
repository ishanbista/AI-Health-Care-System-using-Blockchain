 # TeleHealth: AI + Blockchain Healthcare Platform

A modern healthcare platform that connects patients with the right doctors using AI-powered symptom analysis and blockchain technology for secure medical data management.

## 🌟 Features

### For Patients
- **AI Symptom Analysis**: Smart matching with appropriate specialists based on symptom analysis
- **Secure Medical Records**: Blockchain-powered storage for complete privacy and transparency
- **Remote Consultations**: Connect with doctors through secure video calls
- **Health Metrics Tracking**: Monitor and manage personal health data
- **Appointment Management**: Schedule and manage medical appointments

### For Doctors
- **Smart Patient Matching**: Receive patient requests matched by AI analysis
- **Blockchain Security**: Secure access to patient medical records
- **Dashboard Analytics**: Track consultations and patient interactions
- **Profile Management**: Manage availability and consultation settings
- **Patient Communication**: Secure messaging system with patients

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.2.4, React 19
- **Styling**: TailwindCSS, shadcn/ui components
- **Authentication**: Custom auth system with blockchain integration
- **AI Integration**: Gemini AI for symptom analysis
- **State Management**: React Context API
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: 
  - Radix UI primitives
  - Lucide React icons
  - Framer Motion animations
  - Recharts for data visualization

## 🚀 Demo Video
Project Video Google Drive Link: <br>
https://drive.google.com/file/d/18GJ873w927LNP-8byYFk15HZwPYmnI0P/view?usp=sharing
## 🚀 Getting Started

### Prerequisites
- Node.js (Latest LTS version)
- PNPM package manager
- MetaMask or similar Web3 wallet

### Installation

1. Clone the repository
```bash
git clone https://github.com/ishanbista/AIHealthCare.git
cd AIHealthCare
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with necessary environment variables:
```env
NEXT_PUBLIC_API_URL=your_api_url
GEMINI_API_KEY=your_gemini_api_key
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
├── app/                  # Next.js 13+ app directory
│   ├── api/             # API routes
│   ├── doctor/          # Doctor dashboard
│   ├── patient/         # Patient dashboard
│   └── layout.tsx       # Root layout
├── components/          # Reusable components
├── lib/                 # Utility functions and contexts
├── public/             # Static assets
└── styles/             # Global styles
```

## 🔒 Security Features

- Blockchain-based data storage
- End-to-end encrypted communications
- Secure medical record access

## 🎨 UI/UX Features

- Responsive design
- Dark/Light theme support
- Accessible components
- Interactive animations
- Custom medical-themed color palette

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

Your Name -Ishan Bista

Project Link: [https://github.com/ishanbista/AI-Health-Care-System-using-Blockchain]
