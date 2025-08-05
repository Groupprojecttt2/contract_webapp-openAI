# 🚀 Comprehensive Contract WebApp Development Prompt for Cursor

## Project Overview
Create a modern, AI-powered contract generation and analysis webapp using Next.js 15, React 18, TypeScript, and OpenAI GPT-4o-mini. This should be a comprehensive legal document management system with advanced features for contract creation, analysis, risk assessment, and collaboration.

## 🏗️ Core Architecture

### Tech Stack Requirements
- **Frontend**: Next.js 15, React 18, TypeScript
- **AI Integration**: OpenAI GPT-4o-mini API
- **Styling**: Tailwind CSS + Radix UI components
- **Authentication**: Firebase Auth (or Supabase)
- **Database**: Firebase Firestore (or Supabase)
- **Document Processing**: jsPDF, docx for export
- **State Management**: React hooks + Context API
- **Form Handling**: React Hook Form + Zod validation

### Project Structure
```
app/
├── api/
│   ├── ai/
│   │   ├── chat/route.ts
│   │   ├── generate-document/route.ts
│   │   ├── process-document/route.ts
│   │   └── download-file/route.ts
│   ├── contracts/
│   │   ├── generate/route.ts
│   │   ├── analyze-document/route.ts
│   │   ├── risk-analysis/route.ts
│   │   ├── improve/route.ts
│   │   ├── quick-edit/route.ts
│   │   ├── review-checklist/route.ts
│   │   ├── explain-text/route.ts
│   │   ├── get-recommendations/route.ts
│   │   └── export/route.ts
│   └── email/
│       ├── welcome/route.ts
│       └── login-notification/route.ts
├── (pages)/
│   ├── dashboard/page.tsx
│   ├── generator/page.tsx
│   ├── templates/page.tsx
│   ├── contract-suite/page.tsx
│   ├── chat/page.tsx
│   ├── contract/[id]/page.tsx
│   ├── login/page.tsx
│   └── signup/page.tsx
components/
├── ui/ (Radix UI components)
├── contract-editor.tsx
├── contract-ai-tools.tsx
├── contract-quick-actions.tsx
├── interactive-dashboard.tsx
├── risk-analysis-dashboard.tsx
├── signature-pad.tsx
├── chat-interface.tsx
├── ai-chat-bar.tsx
└── export-button.tsx
lib/
├── openai.ts
├── firebaseClient.ts
├── firebaseAdmin.ts
└── utils.ts
```

## 🎯 Core Features to Implement

### 1. **AI-Powered Contract Generation**
- **Templates**: Service Agreements, NDAs, Employment Contracts, Software Licenses, Consulting Agreements, Partnership Agreements
- **Smart Form**: Dynamic form fields based on contract type
- **AI Enhancement**: OpenAI generates professional contract content
- **Real-time Preview**: Live contract preview as user types
- **Validation**: Form validation with Zod schemas

### 2. **Advanced Contract Editor**
- **Rich Text Editing**: WYSIWYG editor with formatting
- **Highlighting System**: Multi-color highlighting with notes
- **Collaborative Features**: Real-time collaboration indicators
- **Version History**: Track changes and revert functionality
- **Auto-save**: Automatic saving with manual save option
- **Undo/Redo**: Full undo/redo functionality

### 3. **Smart Risk Analysis Dashboard**
- **Risk Scoring**: 0-100 scale with visual indicators
- **Category Breakdown**: Legal, Financial, Operational, Compliance, Reputation
- **Industry-Specific Models**: Technology, Healthcare, Finance, Construction, General
- **Color-Coded Risk Levels**: Green (0-39), Yellow (40-59), Orange (60-79), Red (80-100)
- **Interactive Charts**: Progress bars and trend indicators
- **Recommendations**: AI-generated improvement suggestions

### 4. **AI Chat Assistant**
- **Context-Aware**: Understands current contract context
- **Multi-modal**: Text, file upload, and document analysis
- **Real-time Responses**: Streaming chat responses
- **History**: Persistent chat history
- **Export**: Export chat conversations
- **Smart Suggestions**: Contextual help and recommendations

### 5. **Document Processing & Analysis**
- **PDF Upload**: Drag-and-drop PDF processing
- **Word Document Support**: .docx file processing
- **Text Extraction**: OCR and text extraction
- **AI Analysis**: Comprehensive document analysis
- **Risk Assessment**: Automated risk identification
- **Compliance Checking**: Legal compliance verification

### 6. **E-Signature Integration**
- **Digital Signatures**: Canvas-based signature drawing
- **Inline Integration**: Signatures appear within contract text
- **Multi-party Support**: Party A and Party B signatures
- **Signature Validation**: Verify signature authenticity
- **Export with Signatures**: Include signatures in exported documents

### 7. **Export & Download Features**
- **Multiple Formats**: PDF, Word (.docx), Plain Text
- **Custom Styling**: Professional document formatting
- **Signature Inclusion**: Export with digital signatures
- **Batch Export**: Export multiple documents
- **Template Export**: Export contract templates

### 8. **Interactive Dashboard**
- **Contract Overview**: Recent contracts and statistics
- **Quick Actions**: Fast access to common tasks
- **Analytics**: Usage statistics and insights
- **Notifications**: System notifications and alerts
- **Search**: Global search across contracts

## 🔧 Technical Implementation Requirements

### OpenAI Integration (`lib/openai.ts`)
```typescript
// Centralized OpenAI configuration with proper error handling
export class OpenAIHelper {
  private client: OpenAI;
  
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  
  async generateContract(template: string, details: any): Promise<string>
  async analyzeContract(content: string): Promise<AnalysisResult>
  async assessRisk(content: string, industry: string): Promise<RiskAnalysis>
  async generateChatResponse(messages: any[]): Promise<string>
  async improveContract(content: string, improvements: string[]): Promise<string>
}
```

### Error Handling Best Practices
- **API Error Handling**: Proper OpenAI API error handling
- **Rate Limiting**: Implement request throttling
- **Fallback Responses**: Graceful degradation when AI fails
- **User Feedback**: Clear error messages and retry options
- **Logging**: Comprehensive error logging for debugging

### Security Considerations
- **Input Validation**: Sanitize all user inputs
- **API Key Protection**: Secure environment variable handling
- **Authentication**: Proper user authentication and authorization
- **Data Privacy**: Secure handling of sensitive contract data
- **CORS Configuration**: Proper CORS setup for API routes

### Performance Optimization
- **Caching**: Implement response caching for AI requests
- **Lazy Loading**: Load components and data on demand
- **Image Optimization**: Optimize signature images and exports
- **Bundle Optimization**: Minimize JavaScript bundle size
- **Database Indexing**: Optimize database queries

## 🎨 UI/UX Design Requirements

### Design System
- **Theme Support**: Light/dark mode with theme toggle
- **Responsive Design**: Mobile-first responsive layout
- **Accessibility**: WCAG 2.1 AA compliance
- **Loading States**: Skeleton screens and progress indicators
- **Toast Notifications**: User feedback and status updates

### Component Library
- **Radix UI**: Use Radix UI for accessible components
- **Custom Components**: Build custom components for specific features
- **Consistent Styling**: Maintain design consistency across components
- **Interactive Elements**: Hover effects and smooth animations

## 🚨 Critical Implementation Notes (Lessons Learned)

### 1. **RegExp Safety in Contract Editor**
```typescript
// ❌ WRONG - Can cause "Invalid string length" errors
result = result.replace(new RegExp(escapeHtml(placeholder), 'g'), signatureHtml)

// ✅ CORRECT - Proper regex escaping
const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
result = result.replace(new RegExp(escapedPlaceholder, 'g'), signatureHtml)
```

### 2. **OpenAI API Error Handling**
```typescript
// Always implement proper error handling for OpenAI API calls
try {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages,
    max_tokens: 4000,
    temperature: 0.7,
  });
  return response.choices[0].message.content;
} catch (error) {
  if (error.code === 'rate_limit_exceeded') {
    throw new Error('Rate limit exceeded. Please try again in a moment.');
  }
  if (error.code === 'quota_exceeded') {
    throw new Error('API quota exceeded. Please check your OpenAI account.');
  }
  throw new Error('Failed to generate response. Please try again.');
}
```

### 3. **State Management Best Practices**
```typescript
// Use proper state management for complex forms
const [contractData, setContractData] = useState<ContractData>({});
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// Implement proper loading states
const handleGenerate = async () => {
  setIsLoading(true);
  setError(null);
  try {
    const result = await generateContract(contractData);
    setContractData(prev => ({ ...prev, content: result }));
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};
```

### 4. **File Upload Security**
```typescript
// Implement proper file validation
const validateFile = (file: File) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  if (file.size > maxSize) {
    throw new Error('File size must be less than 10MB');
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only PDF and Word documents are allowed');
  }
};
```

### 5. **Database Schema Design**
```typescript
// Design proper database schemas for contracts
interface Contract {
  id: string;
  title: string;
  content: string;
  type: ContractType;
  status: 'draft' | 'review' | 'signed' | 'archived';
  parties: Party[];
  signatures: Signature[];
  highlights: Highlight[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
}
```

## 📋 Development Checklist

### Phase 1: Foundation
- [ ] Set up Next.js 15 project with TypeScript
- [ ] Configure Tailwind CSS and Radix UI
- [ ] Set up Firebase/Supabase authentication
- [ ] Create basic layout and navigation
- [ ] Implement theme provider and dark mode

### Phase 2: Core Features
- [ ] Build contract editor component
- [ ] Implement AI integration with OpenAI
- [ ] Create contract generation system
- [ ] Build risk analysis dashboard
- [ ] Implement signature pad component

### Phase 3: Advanced Features
- [ ] Add document processing (PDF/Word)
- [ ] Implement AI chat assistant
- [ ] Create export functionality
- [ ] Build interactive dashboard
- [ ] Add collaboration features

### Phase 4: Polish & Testing
- [ ] Implement comprehensive error handling
- [ ] Add loading states and animations
- [ ] Optimize performance
- [ ] Test all features thoroughly
- [ ] Deploy to production

## 🔑 Environment Variables Required
```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Optional: Supabase (if using instead of Firebase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🎯 Success Metrics
- **Performance**: Page load times under 2 seconds
- **Reliability**: 99.9% uptime for AI features
- **User Experience**: Intuitive interface with minimal learning curve
- **Security**: No data breaches or unauthorized access
- **Scalability**: Handle 1000+ concurrent users

This comprehensive prompt should guide you to build a robust, feature-rich contract webapp that avoids the common pitfalls and implements best practices learned from the original project. 