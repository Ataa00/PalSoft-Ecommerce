# E-commerce Frontend Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
The `.env.local` file has been created with default values:

```env
# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production-min-32-chars
NEXTAUTH_URL=http://localhost:3001

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:5056/api
```

### 3. Run the Application
```bash
npm run dev
```

The application will be available at: **http://localhost:3001**

## 🔧 API Integration Testing

### Option 1: With Backend API
1. **Start your .NET backend** at `http://localhost:5056`
2. **Test API integration**:
   - Go to `/login` and toggle "Use Custom API Authentication"
   - Go to `/register` and toggle "Use Custom API Registration"
   - Products will load from your API

### Option 2: Without Backend (Fallback Mode)
- The application automatically falls back to static data when the API is unavailable
- All features work with demo data
- Perfect for frontend development and testing

## 🧪 Testing Features

### Authentication Testing
1. **NextAuth (Demo Mode)**:
   - Email: `demo@example.com`
   - Password: `123456`

2. **Custom API Mode**:
   - Toggle the checkbox on login/register pages
   - Use your actual API credentials

### Product Features
- ✅ Product listing with API integration
- ✅ Product search and filtering
- ✅ Shopping cart functionality
- ✅ Product categories
- ✅ Responsive design

### Error Handling
- ✅ API connection errors
- ✅ Authentication failures
- ✅ Network timeouts
- ✅ Graceful fallbacks

## 📋 Available Pages

- **Home**: `/` - Main landing page
- **Products**: `/products` - Product listing with filters
- **Product Details**: `/product/[id]` - Individual product pages
- **Login**: `/login` - Authentication page
- **Register**: `/register` - User registration
- **Cart**: Accessible via cart icon
- **Checkout**: `/checkout` - Order completion

## 🔍 Development Tools

### API Test Component
Add this to any page for comprehensive API testing:
```tsx
import ApiTestComponent from '@/components/ApiTestComponent';

// Add to your page component
<ApiTestComponent />
```

### Environment Variables
- `NEXT_PUBLIC_API_BASE_URL`: Backend API URL
- `NEXTAUTH_SECRET`: Required for NextAuth
- `NEXTAUTH_URL`: Frontend URL for NextAuth callbacks

## 🚨 Troubleshooting

### Common Issues

1. **Port 3000 in use**: App automatically uses port 3001
2. **API connection failed**: App falls back to demo data
3. **NextAuth errors**: Ensure `NEXTAUTH_SECRET` is set
4. **Image loading issues**: Check `next.config.ts` remote patterns

### Backend Connection
If your backend is running on a different port, update:
```env
NEXT_PUBLIC_API_BASE_URL=https://localhost:YOUR_PORT/api
```

### Production Deployment
1. Update `NEXTAUTH_SECRET` with a secure random string
2. Update `NEXTAUTH_URL` to your production domain
3. Update `NEXT_PUBLIC_API_BASE_URL` to your production API

## 📚 Documentation

- **API Integration**: See `API_INTEGRATION_README.md`
- **Component Documentation**: Check individual component files
- **Type Definitions**: See `src/types/product.ts`

## ✅ Verification Checklist

- [ ] Application starts without errors
- [ ] Home page loads with products
- [ ] Login/register pages work
- [ ] Cart functionality works
- [ ] API integration toggles work
- [ ] Fallback data loads when API is unavailable
- [ ] No console errors in browser

## 🎯 Next Steps

1. **Test with your backend API**
2. **Customize styling and branding**
3. **Add additional features from the task list**
4. **Deploy to production**

---

**Need help?** Check the console logs for detailed error messages and API call information.
