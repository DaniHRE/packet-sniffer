# Packet Sniffer Web App

Uma aplicação web simples que permite "farejar" o tráfego de rede diretamente no navegador.

![Next.js](https://img.shields.io/badge/Next.js-13+-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3+-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 📦 Tecnologias Utilizadas

- ✅ Next.js com App Router
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ Node.js (Express no diretório `server/`)
- ✅ Lib nativa `cap` para captura de pacotes

## 🚀 Como Iniciar

### Pré-requisitos

- Node.js 18+
- npm, yarn ou pnpm
- [WinPcap/Npcap (Windows)](https://npcap.com/) ou `libpcap` (Linux/macOS)
- Python 3 e ferramentas de build nativas (ex: `build-essential`, `windows-build-tools`)

### Instalação

1. Clone o repositório:

```bash
git clone https://github.com/DaniHRE/packet-sniffer.git
cd packet-sniffer
```

2. Instale as dependências:

```bash
npm install
# ou
pnpm install
```

3. Configure a lib `cap` (para sniffing):

#### No Windows

- Instale o [Npcap](https://npcap.com/) com suporte a WinPcap API.
- Reinicie o sistema se necessário.
- Certifique-se de que está com permissões de administrador.

#### No Linux

```bash
sudo apt update
sudo apt install libpcap-dev build-essential python3
```

#### No macOS

```bash
brew install libpcap
xcode-select --install
```

4. Execute o servidor de captura:

```bash
npm run sniffer
# ou
pnpm run sniffer
```

5. Em outro terminal, inicie o front-end:

```bash
npm run dev
# ou
pnpm dev
```

6. Acesse [http://localhost:3000](http://localhost:3000) no navegador.

## 📁 Estrutura do Projeto

```
packet-sniffer/
├── app/                 # Páginas e layouts do Next.js
│   └── page.tsx         # Página inicial
├── server/              # Servidor Express para captura de pacotes
├── components.json      # Configuração de componentes
├── next.config.ts       # Configuração do Next.js
├── package.json         # Dependências e scripts
├── postcss.config.mjs   # Configuração do PostCSS
├── tailwind.config.js   # Configuração do Tailwind CSS
├── tsconfig.json        # Configuração do TypeScript
└── README.md            # Este arquivo
```

## 🔒 Segurança

Esta aplicação é destinada para fins educacionais e de demonstração. Certifique-se de utilizá-la em ambientes controlados e com as permissões adequadas.

## 📄 Licença

Este projeto está licenciado sob a Licença MIT. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.