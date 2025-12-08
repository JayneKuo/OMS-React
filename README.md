# OMS React - Order Management System

A modern Order Management System built with Next.js 14, TypeScript, and Tailwind CSS, following Item's design system guidelines.

## Features

- 📊 **Dashboard** - Overview of key metrics and recent activities
- 🛒 **Orders** - Complete order management and tracking
- 🔄 **Returns** - Handle product returns and refunds
- 🛍️ **Purchase** - Manage purchase orders and suppliers
- 🚚 **Logistics** - Track shipments and manage logistics
- 📦 **Inventory** - Monitor stock levels across warehouses
- 📦 **Product** - Manage product catalog
- 📅 **Events** - System events and activity logs
- 🔌 **Integrations** - Connect with third-party services
- 📄 **POM** - Purchase Order Management
- ⚡ **Automation** - Configure automated workflows
- 👥 **Customer Management** - Manage customer relationships
- 🏪 **Merchant Management** - Handle merchant accounts

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React

## Design System

This project follows Item's design guidelines:

### Colors
- **Primary**: Purple (#763abf) - Brand color for primary actions
- **Secondary**: Orange (#F97316) - Accent color for CTAs
- **Background**: Light (#fafafa) / Dark (#000000)
- **Grayscale**: Complete spectrum from Mist to Shadow

### Typography
- **Font Family**: Satoshi (Variable font)
- **Weights**: Light (300), Regular (400), Medium (500), Bold (700), Black (900)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/JayneKuo/OMS-React.git
cd OMS-React
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
OMS React/
├── app/                          # Next.js app directory
│   ├── dashboard/               # Dashboard page
│   ├── orders/                  # Orders management
│   ├── returns/                 # Returns handling
│   ├── purchase/                # Purchase orders
│   ├── logistics/               # Logistics tracking
│   ├── inventory/               # Inventory management
│   ├── product/                 # Product catalog
│   ├── events/                  # Event logs
│   ├── integrations/            # Third-party integrations
│   ├── pom/                     # Purchase Order Management
│   ├── automation/              # Workflow automation
│   ├── customer-management/     # Customer CRM
│   ├── merchant-management/     # Merchant accounts
│   ├── globals.css              # Global styles
│   └── layout.tsx               # Root layout
├── components/
│   ├── layout/                  # Layout components
│   │   ├── sidebar.tsx         # Navigation sidebar
│   │   ├── header.tsx          # Top header
│   │   └── main-layout.tsx     # Main layout wrapper
│   └── ui/                      # Reusable UI components
├── lib/
│   └── utils.ts                 # Utility functions
├── public/                      # Static assets
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Color System

The application uses shadcn/ui color system with Item's brand colors:

### Light Mode
- Background: `#fafafa`
- Foreground: `#181818`
- Primary: `#763abf` (Purple)
- Secondary: `#dbdbdb`

### Dark Mode
- Background: `#000000`
- Foreground: `#ffffff`
- Primary: `#763abf` (Purple)
- Secondary: `#2b2e31`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Contact

Project Link: [https://github.com/JayneKuo/OMS-React](https://github.com/JayneKuo/OMS-React)
