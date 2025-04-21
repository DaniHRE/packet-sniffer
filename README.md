# Packet Sniffer Web App

A simple web application that allows you to "sniff" network traffic directly in your browser.

[Leia em Português 🇧🇷](/readme/pt-BR/README.md)

![Next.js](https://img.shields.io/badge/Next.js-13+-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3+-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 📦 Technologies Used

- ✅ Next.js with App Router
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ Node.js (Express in the `server/` directory)
- ✅ Native `cap` library for packet capturing

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- [WinPcap/Npcap (Windows)](https://npcap.com/) or `libpcap` (Linux/macOS)
- Python 3 and native build tools (e.g., `build-essential`, `windows-build-tools`)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/DaniHRE/packet-sniffer.git
cd packet-sniffer
```

2. Install the dependencies:

```bash
npm install
# or
pnpm install
```

3. Configure the `cap` library (for sniffing):

#### On Windows

- Install [Npcap](https://npcap.com/) with WinPcap API support.
- Restart the system if necessary.
- Ensure you have administrator permissions.

#### On Linux

```bash
sudo apt update
sudo apt install libpcap-dev build-essential python3
```

#### On macOS

```bash
brew install libpcap
xcode-select --install
```

4. Run the capture server:

```bash
npm run sniffer
# or
pnpm run sniffer
```

5. In another terminal, start the front-end:

```bash
npm run dev
# or
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
packet-sniffer/
├── app/                 # Next.js pages and layouts
│   └── page.tsx         # Home page
├── server/              # Express server for packet capturing
├── components.json      # Components configuration
├── next.config.ts       # Next.js configuration
├── package.json         # Dependencies and scripts
├── postcss.config.mjs   # PostCSS configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── README.md            # This file
```

## 🔒 Security

This application is intended for educational and demonstration purposes. Make sure to use it in controlled environments and with appropriate permissions.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.