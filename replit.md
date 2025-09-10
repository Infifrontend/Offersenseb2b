# Offersenseb2b Travel Offers Management System

## Overview

Offersenseb2b is a comprehensive B2B travel offers management platform built with modern React technologies. The application provides travel businesses with sophisticated tools to manage pricing, discounts, and agent relationships across multiple distribution channels. It features a clean, professional interface built with Ant Design components and shadcn/ui, designed specifically for travel industry professionals to optimize their pricing strategies and agent management workflows.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The application uses a **modern React single-page application (SPA)** architecture with the following key design decisions:

- **Component Library Strategy**: Dual UI framework approach combining Ant Design for complex data components and shadcn/ui for foundational elements, providing both rich functionality and design consistency
- **Routing**: Wouter for lightweight client-side routing with 14 main feature modules
- **State Management**: TanStack Query for server state management with built-in caching and synchronization
- **Styling**: Tailwind CSS with CSS custom properties for theming and responsive design
- **Build System**: Vite for fast development builds and optimized production bundles

### Backend Architecture
The application follows a **lightweight Express.js server** pattern:

- **API Layer**: Express.js server with modular route structure supporting RESTful endpoints
- **Development Setup**: Vite integration for hot module replacement and development middleware
- **Storage Interface**: Abstracted storage layer supporting both in-memory (development) and database implementations
- **Error Handling**: Centralized error handling with structured JSON responses

### Data Storage Solutions
The system is designed with **database flexibility** in mind:

- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Database**: PostgreSQL configured via Neon Database for production scalability
- **Schema Management**: Centralized schema definitions with Zod validation
- **Migration Strategy**: Drizzle Kit for database schema migrations and version control

### Authentication and Authorization
Currently implements a **minimal user management foundation**:

- **User Schema**: Basic user model with username/password authentication structure
- **Session Management**: Connect-pg-simple for PostgreSQL-backed session storage
- **Extensibility**: Designed to support role-based access control for agent tiers and permissions

### External Dependencies

**Database Services**:
- Neon Database (@neondatabase/serverless) - Serverless PostgreSQL for production data storage
- PostgreSQL session store (connect-pg-simple) - Persistent session management

**UI Component Libraries**:
- Ant Design (antd) - Primary component library for complex data tables, forms, and business logic components
- Radix UI primitives - Headless components for accessibility and customization
- shadcn/ui - Pre-styled components built on Radix primitives for consistent design system

**Development Tools**:
- Replit integration - Development environment optimizations and error overlay
- Vite plugins - Hot reload, error handling, and build optimization

**Utility Libraries**:
- TanStack Query - Server state management, caching, and data synchronization
- Wouter - Lightweight routing solution
- Tailwind CSS - Utility-first styling framework
- date-fns - Date manipulation and formatting
- Lucide React - Icon library for consistent iconography

The application is structured to handle complex travel industry workflows including fare management, agent relationships, and dynamic pricing strategies while maintaining a clean separation of concerns between presentation, business logic, and data layers.