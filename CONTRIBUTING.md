# Contributing to AI HeartBridge

Thank you for your interest in contributing to AI HeartBridge! This document provides guidelines and best practices for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)

## 🤝 Code of Conduct

### Our Pledge

This project is focused on relationship therapy and mental health. We are committed to:
- Maintaining a safe, welcoming, and inclusive environment
- Respecting all contributors and users
- Prioritizing user privacy and safety
- Following evidence-based therapeutic practices

### Expected Behavior

- Be respectful and constructive in all interactions
- Focus on what is best for the community and users
- Show empathy towards other community members
- Accept constructive criticism gracefully

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Git
- Code editor (VS Code recommended)

### Setup

1. **Fork and clone the repository**
```bash
git clone https://github.com/yourusername/ai-heartbridge.git
cd ai-heartbridge
```

2. **Install dependencies**
```bash
# Frontend
npm install

# Backend
cd server
npm install
cd ..
```

3. **Configure environment variables**
```bash
# Copy example files
cp .env.example .env
cp server/.env.example server/.env

# Edit .env files with your values
```

4. **Start development servers**
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
npm run dev
```

## 💻 Development Workflow

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions/updates

Example: `feature/add-video-chat` or `fix/chat-scroll-issue`

### Commit Messages

Follow conventional commits:

```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Build process or auxiliary tool changes

Examples:
```
feat(chat): add voice message support
fix(auth): resolve token refresh issue
docs(readme): update installation instructions
refactor(components): consolidate chat components
```

## 📝 Code Standards

### TypeScript

- Use TypeScript for all new code
- Maintain strict type safety
- Avoid `any` types when possible
- Document complex types with JSDoc comments

```typescript
// Good
interface User {
  id: string;
  email: string;
  profile?: UserProfile;
}

// Bad
const user: any = { ... };
```

### React Components

- Use functional components with hooks
- Prefer named exports for components
- Keep components focused and single-responsibility
- Use proper prop typing

```typescript
// Good
interface ChatMessageProps {
  message: Message;
  isOwn: boolean;
  onDelete?: (id: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  isOwn, 
  onDelete 
}) => {
  // Component implementation
};
```

### State Management

- Use Zustand for global state
- Use React Query for server state
- Keep local state minimal
- Avoid prop drilling

### Styling

- Use Tailwind CSS classes
- Follow the design system in `src/design-system/tokens.ts`
- Maintain accessibility (WCAG 2.1 AA+)
- Test responsive design

### API Design

- Follow RESTful conventions
- Use proper HTTP methods and status codes
- Validate all inputs
- Handle errors consistently
- Document endpoints

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test with UI
npm run test:ui
```

### Writing Tests

- Write tests for all new features
- Maintain >80% code coverage
- Test edge cases and error conditions
- Use descriptive test names

```typescript
describe('ChatSession', () => {
  it('should create a new session with default title', () => {
    // Test implementation
  });

  it('should handle API errors gracefully', () => {
    // Test implementation
  });
});
```

## 🔍 Code Review

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] No linting errors
- [ ] Types are properly defined
- [ ] Documentation is updated
- [ ] Accessibility tested
- [ ] Mobile responsiveness checked

### Review Process

1. Submit PR with clear description
2. Link related issues
3. Wait for CI checks to pass
4. Address reviewer feedback
5. Maintain clean commit history

## 📦 Pull Request Process

### Creating a PR

1. **Update your branch**
```bash
git checkout main
git pull origin main
git checkout your-branch
git rebase main
```

2. **Push your changes**
```bash
git push origin your-branch
```

3. **Create PR with:**
   - Clear title and description
   - Link to related issues
   - Screenshots/videos for UI changes
   - Testing instructions
   - Breaking changes documented

### PR Template

```markdown
## Description
Brief description of changes

## Related Issues
Fixes #123

## Changes Made
- Added X feature
- Fixed Y bug
- Updated Z documentation

## Testing
How to test these changes

## Screenshots
If applicable

## Checklist
- [ ] Tests pass
- [ ] No linting errors
- [ ] Documentation updated
- [ ] Accessibility tested
```

## 🎨 Design Principles

### User Experience

- **Privacy First**: Always consider user privacy
- **Safety Priority**: Detect and handle crisis situations
- **Accessibility**: Ensure all features are accessible
- **Performance**: Maintain fast load times and responsiveness
- **Simplicity**: Keep UI intuitive and uncluttered

### Code Quality

- **Maintainability**: Write clear, documented code
- **Scalability**: Design for growth
- **Testability**: Make code easy to test
- **Reusability**: Create reusable components
- **Performance**: Optimize where it matters

## 🔒 Security

### Reporting Security Issues

**Do not open public issues for security vulnerabilities.**

Contact the maintainers privately:
- Email: [security@aiheartbridge.com]
- Include detailed description
- Provide reproduction steps
- Suggest fix if possible

### Security Best Practices

- Never commit sensitive data
- Use environment variables
- Validate all user inputs
- Sanitize data before storage
- Follow OWASP guidelines

## 📚 Resources

### Documentation

- [Project Plan](docs/copilot.md)
- [API Documentation](server/README.md)
- [Component Library](src/components/README.md)
- [Changelog](CHANGELOG.md)

### Learning Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Gottman Method](https://www.gottman.com/)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 🎯 Areas for Contribution

### High Priority

- [ ] End-to-end encryption for messages
- [ ] Video call integration
- [ ] Advanced analytics with ML
- [ ] Multi-language support
- [ ] Automated testing coverage

### Good First Issues

- [ ] Documentation improvements
- [ ] UI enhancements
- [ ] Bug fixes
- [ ] Test additions
- [ ] Accessibility improvements

## 📞 Getting Help

- **Questions**: Open a discussion on GitHub
- **Bugs**: Create an issue with reproduction steps
- **Features**: Propose via feature request issue
- **Chat**: Join our community [Discord/Slack]

## 🙏 Thank You

Every contribution, no matter how small, makes AI HeartBridge better for couples seeking relationship support. Thank you for being part of this important mission!

---

*Last updated: October 2025*

