import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

import TextAtom   from '../components/atoms/TextAtom'
import BoxAtom    from '../components/atoms/BoxAtom'
import ButtonAtom from '../components/atoms/ButtonAtom'
import InputForm  from '../components/molecules/InputForm'
import Form       from '../components/molecules/Form'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function CircuitPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="circuit" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <path
            d="M30 0v15m0 30v15M0 30h15m30 0h15M15 15h30v30H15z"
            fill="none"
            stroke="var(--color-brand-700)"
            strokeWidth="0.75"
            opacity="0.3"
          />
          <circle cx="30" cy="30" r="2" fill="none" stroke="var(--color-brand-700)" strokeWidth="0.75" opacity="0.3" />
          <circle cx="15" cy="15" r="1.5" fill="var(--color-brand-700)" opacity="0.3" />
          <circle cx="45" cy="15" r="1.5" fill="var(--color-brand-700)" opacity="0.3" />
          <circle cx="15" cy="45" r="1.5" fill="var(--color-brand-700)" opacity="0.3" />
          <circle cx="45" cy="45" r="1.5" fill="var(--color-brand-700)" opacity="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#circuit)" />
    </svg>
  )
}

export default function LoginView() {
  const navigate = useNavigate()
  const auth = useAuth()

  const [activeTab, setActiveTab] = useState('login')
  const [error, setError]         = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [loginFields, setLoginFields] = useState({ email: '', password: '' })
  const [loginErrors, setLoginErrors] = useState({})

  const [registerFields, setRegisterFields] = useState({
    name: '', organization: '', email: '', password: '',
  })
  const [registerErrors, setRegisterErrors] = useState({})

  if (auth.isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const switchTab = (tab) => {
    setActiveTab(tab)
    setError(null)
    setLoginErrors({})
    setRegisterErrors({})
  }

  const clearErrorOnType = (setter) => (field) => (e) => {
    setter((prev) => ({ ...prev, [field]: e.target.value }))
    setError(null)
  }

  const handleLoginChange  = clearErrorOnType(setLoginFields)
  const handleRegisterChange = clearErrorOnType(setRegisterFields)

  const validateLogin = () => {
    const errs = {}
    if (!loginFields.email.trim()) errs.email = 'Email is required'
    else if (!EMAIL_RE.test(loginFields.email)) errs.email = 'Enter a valid email'
    if (!loginFields.password) errs.password = 'Password is required'
    else if (loginFields.password.length < 8) errs.password = 'Min. 8 characters'
    setLoginErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validateRegister = () => {
    const errs = {}
    if (!registerFields.name.trim()) errs.name = 'Name is required'
    else if (registerFields.name.trim().length < 2) errs.name = 'Min. 2 characters'
    if (!registerFields.organization.trim()) errs.organization = 'Organization is required'
    else if (registerFields.organization.trim().length < 2) errs.organization = 'Min. 2 characters'
    if (!registerFields.email.trim()) errs.email = 'Email is required'
    else if (!EMAIL_RE.test(registerFields.email)) errs.email = 'Enter a valid email'
    if (!registerFields.password) errs.password = 'Password is required'
    else if (registerFields.password.length < 8) errs.password = 'Min. 8 characters'
    setRegisterErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleLoginSubmit = async () => {
    if (!validateLogin()) return
    setIsSubmitting(true)
    try {
      await auth.login({
        email: loginFields.email,
        password: loginFields.password,
      })
      navigate('/')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegisterSubmit = async () => {
    if (!validateRegister()) return
    setIsSubmitting(true)
    try {
      await auth.register({
        name: registerFields.name,
        email: registerFields.email,
        password: registerFields.password,
        tenantName: registerFields.organization,
      })
      navigate('/')
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const tabClasses = (tab) => [
    'rounded-none border-0 border-b-2 px-4 py-2',
    activeTab === tab
      ? 'border-brand-600 text-brand-700 font-semibold'
      : 'border-transparent text-gray-500 hover:text-gray-700',
  ].join(' ')

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">

      {/* ── Left Panel (brand) ── */}
      <div className="hidden md:flex flex-col justify-between bg-gradient-linear-45-800-600 relative overflow-hidden p-12">
        <CircuitPattern />

        <div className="relative z-10">
          <TextAtom variant="display-lg" weight="bold" family="serif" className="text-white">
            ArchIA
          </TextAtom>
          <TextAtom variant="text-md" className="text-brand-100 mt-3">
            Software architecture intelligence
          </TextAtom>
        </div>

        <div className="relative z-10">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-body-xs font-mono text-brand-200 border border-brand-400/30">
            v2.0 · beta
          </span>
        </div>
      </div>

      {/* ── Right Panel (form) ── */}
      <BoxAtom
        display="flex"
        direction="col"
        justify="center"
        align="center"
        bg="gray-25"
        className="p-8 md:p-12"
      >
        <div className="w-full max-w-md">

          {/* Mobile-only logo */}
          <div className="md:hidden mb-8 text-center">
            <TextAtom variant="display-sm" weight="bold" family="serif" className="text-gray-900">
              ArchIA
            </TextAtom>
          </div>

          {/* Heading */}
          <TextAtom variant="display-sm" weight="bold" family="serif" className="text-gray-900 mb-6">
            {activeTab === 'login' ? 'Welcome back' : 'Get started'}
          </TextAtom>

          {/* Tab switcher */}
          <div className="flex border-b border-gray-200 mb-6">
            <ButtonAtom
              intent="ghost"
              size="sm"
              className={tabClasses('login')}
              onClick={() => switchTab('login')}
            >
              Log in
            </ButtonAtom>
            <ButtonAtom
              intent="ghost"
              size="sm"
              className={tabClasses('register')}
              onClick={() => switchTab('register')}
            >
              Create account
            </ButtonAtom>
          </div>

          {/* ── Login Form ── */}
          {activeTab === 'login' && (
            <Form onSubmit={handleLoginSubmit} gap="md">
              <InputForm
                id="login-email"
                label="Email"
                type="email"
                required
                placeholder="architect@company.com"
                value={loginFields.email}
                onChange={handleLoginChange('email')}
                error={loginErrors.email}
              />
              <InputForm
                id="login-password"
                label="Password"
                type="password"
                required
                placeholder="••••••••"
                value={loginFields.password}
                onChange={handleLoginChange('password')}
                error={loginErrors.password}
              />

              {error && (
                <BoxAtom
                  bg="error-50"
                  border="error-300"
                  rounded="md"
                  p="3"
                >
                  <TextAtom variant="text-sm" className="text-error-600">
                    {error}
                  </TextAtom>
                </BoxAtom>
              )}

              <ButtonAtom
                intent="primary"
                size="lg"
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Logging in…' : 'Log in'}
              </ButtonAtom>
            </Form>
          )}

          {/* ── Register Form ── */}
          {activeTab === 'register' && (
            <Form onSubmit={handleRegisterSubmit} gap="md">
              <InputForm
                id="register-name"
                label="Full name"
                type="text"
                required
                placeholder="Ada Lovelace"
                value={registerFields.name}
                onChange={handleRegisterChange('name')}
                error={registerErrors.name}
              />
              <InputForm
                id="register-org"
                label="Organization"
                type="text"
                required
                placeholder="Acme Corp"
                value={registerFields.organization}
                onChange={handleRegisterChange('organization')}
                error={registerErrors.organization}
              />
              <InputForm
                id="register-email"
                label="Email"
                type="email"
                required
                placeholder="architect@company.com"
                value={registerFields.email}
                onChange={handleRegisterChange('email')}
                error={registerErrors.email}
              />
              <InputForm
                id="register-password"
                label="Password"
                type="password"
                required
                placeholder="Min. 8 characters"
                value={registerFields.password}
                onChange={handleRegisterChange('password')}
                error={registerErrors.password}
              />

              {error && (
                <BoxAtom
                  bg="error-50"
                  border="error-300"
                  rounded="md"
                  p="3"
                >
                  <TextAtom variant="text-sm" className="text-error-600">
                    {error}
                  </TextAtom>
                </BoxAtom>
              )}

              <ButtonAtom
                intent="primary"
                size="lg"
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Creating account…' : 'Create account'}
              </ButtonAtom>
            </Form>
          )}
        </div>
      </BoxAtom>
    </div>
  )
}
