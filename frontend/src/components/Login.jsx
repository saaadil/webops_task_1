import React, { useState } from 'react';
import { login, signup, verifyOtp } from '../api/client';

const DEPARTMENTS = [
  'CSE',
  'ECE',
  'EEE',
  'ICE',
  'MECH',
  'CHEM',
  'PROD',
  'MME',
  'CIV',
  'MCA',
  'BSC',
  'MBA'
];

export default function Login({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isAwaitingOtp, setIsAwaitingOtp] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [otp, setOtp] = useState('');

  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const getPasswordCriteria = (pwd) => ({
    length: pwd.length >= 8,
    uppercase: /[A-Z]/.test(pwd),
    lowercase: /[a-z]/.test(pwd),
    digit: /\d/.test(pwd),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
  });

  const criteria = getPasswordCriteria(password);
  const criteriaMetCount = Object.values(criteria).filter(Boolean).length;
  const isPasswordStrong = criteriaMetCount === 5;

  const getStrengthInfo = () => {
    if (!password) return { label: '', color: '#CBD5E1', width: '0%' };
    if (criteriaMetCount <= 2) return { label: 'Weak', color: '#EF4444', width: '33%' };
    if (criteriaMetCount <= 4) return { label: 'Medium', color: '#F59E0B', width: '66%' };
    return { label: 'Strong', color: '#10B981', width: '100%' };
  };

  const strengthInfo = getStrengthInfo();

  const validateField = (fieldName, value) => {
    if (fieldName === 'name') {
      const trimmed = (value || '').trim();
      if (!trimmed) return 'Name is required';
      if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
        return "Name must contain only letters, spaces, apostrophes, and hyphens";
      }
      return '';
    }

    if (fieldName === 'email') {
      const trimmed = (value || '').trim();
      if (!trimmed) return 'Email is required';
      if (!/^[a-zA-Z0-9._%+-]+@nitt\.edu$/i.test(trimmed)) {
        return 'Email must be a valid address ending in @nitt.edu';
      }
      return '';
    }

    if (fieldName === 'department') {
      const trimmed = (value || '').trim();
      if (!trimmed || !DEPARTMENTS.includes(trimmed)) {
        return 'Please select a valid department';
      }
      return '';
    }

    if (fieldName === 'password') {
      if (!value) return 'Password is required';
      const c = getPasswordCriteria(value);
      const missing = [];
      if (!c.length) missing.push('at least 8 characters');
      if (!c.uppercase) missing.push('one uppercase letter');
      if (!c.lowercase) missing.push('one lowercase letter');
      if (!c.digit) missing.push('one number');
      if (!c.special) missing.push('one special character');
      if (missing.length > 0) {
        return `Password must include: ${missing.join(', ')}`;
      }
      return '';
    }

    if (fieldName === 'otp') {
      const trimmed = (value || '').trim();
      if (!trimmed) return 'Verification code is required';
      if (!/^\d{6}$/.test(trimmed)) return 'Verification code must be 6 digits';
      return '';
    }

    return '';
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    let val = '';
    if (field === 'name') val = name;
    else if (field === 'email') val = email;
    else if (field === 'department') val = department;
    else if (field === 'password') val = password;
    else if (field === 'otp') val = otp;
    setFieldErrors((prev) => ({ ...prev, [field]: validateField(field, val) }));
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (touched.name) {
      setFieldErrors((prev) => ({ ...prev, name: validateField('name', val) }));
    }
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (isSignUp && touched.email) {
      setFieldErrors((prev) => ({ ...prev, email: validateField('email', val) }));
    }
  };

  const handleDepartmentChange = (e) => {
    const val = e.target.value;
    setDepartment(val);
    if (touched.department) {
      setFieldErrors((prev) => ({ ...prev, department: validateField('department', val) }));
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (isSignUp && touched.password) {
      setFieldErrors((prev) => ({ ...prev, password: validateField('password', val) }));
    }
  };

  const handleOtpChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(val);
    if (touched.otp) {
      setFieldErrors((prev) => ({ ...prev, otp: validateField('otp', val) }));
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    setTouched({
      name: true,
      email: true,
      password: true,
      department: true
    });

    const nameErr = validateField('name', name);
    const emailErr = validateField('email', email);
    const deptErr = validateField('department', department);
    const pwdErr = !isPasswordStrong ? 'Password does not meet all requirements' : '';

    const errorsObj = {
      name: nameErr,
      email: emailErr,
      department: deptErr,
      password: pwdErr
    };
    setFieldErrors(errorsObj);

    if (nameErr || emailErr || deptErr || pwdErr) {
      setError('Please fix the highlighted errors before submitting.');
      return;
    }

    try {
      setLoading(true);
      await signup(name.trim(), email.trim(), password, department.trim());
      setIsAwaitingOtp(true);
      setSuccessMessage(`Verification code sent to ${email.trim()}! Please enter the 6-digit code below.`);
      setFieldErrors({});
      setTouched({});
    } catch (err) {
      const errMsg = err.message || 'Signup failed. Please try again.';
      if (/email/i.test(errMsg)) {
        setFieldErrors((prev) => ({ ...prev, email: errMsg }));
        setTouched((prev) => ({ ...prev, email: true }));
      }
      if (/name/i.test(errMsg)) {
        setFieldErrors((prev) => ({ ...prev, name: errMsg }));
        setTouched((prev) => ({ ...prev, name: true }));
      }
      if (/department/i.test(errMsg)) {
        setFieldErrors((prev) => ({ ...prev, department: errMsg }));
        setTouched((prev) => ({ ...prev, department: true }));
      }
      if (/password/i.test(errMsg)) {
        setFieldErrors((prev) => ({ ...prev, password: errMsg }));
        setTouched((prev) => ({ ...prev, password: true }));
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const otpErr = validateField('otp', otp);
    if (otpErr) {
      setFieldErrors((prev) => ({ ...prev, otp: otpErr }));
      setTouched((prev) => ({ ...prev, otp: true }));
      return;
    }

    try {
      setLoading(true);
      await verifyOtp(email.trim(), otp.trim());
      setSuccessMessage('Account created successfully! Please log in with your credentials.');
      setIsAwaitingOtp(false);
      setIsSignUp(false);
      setPassword('');
      setOtp('');
      setFieldErrors({});
      setTouched({});
    } catch (err) {
      const errMsg = err.message || 'OTP verification failed. Please try again.';
      setFieldErrors((prev) => ({ ...prev, otp: errMsg }));
      setTouched((prev) => ({ ...prev, otp: true }));
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email.trim(), password);
      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess(user);
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setIsAwaitingOtp(false);
    setError(null);
    setSuccessMessage(null);
    setFieldErrors({});
    setTouched({});
    setShowPasswordRequirements(false);
    setOtp('');
  };

  const isSignupDisabled = loading || !isPasswordStrong;
  const isOtpDisabled = loading || otp.trim().length !== 6;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconBadge}>🎪</div>
          <h1 style={styles.title}>NITTFest 2026</h1>
          <p style={styles.subtitle}>
            {isAwaitingOtp
              ? 'Verify your email to complete registration'
              : isSignUp
              ? 'Create your official fest companion account'
              : 'Sign in to access your fest companion'}
          </p>
        </div>

        {error && (
          <div style={styles.errorBanner}>
            <span>⚠️ {error}</span>
          </div>
        )}

        {successMessage && (
          <div style={styles.successBanner}>
            <span>✅ {successMessage}</span>
          </div>
        )}

        {/* OTP VERIFICATION STEP */}
        {isSignUp && isAwaitingOtp ? (
          <form onSubmit={handleVerifyOtpSubmit} style={styles.form} noValidate>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                value={email}
                disabled
                style={{ ...styles.input, backgroundColor: '#F0EBE0', color: '#64748B', cursor: 'not-allowed' }}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="auth-otp">6-Digit Verification Code</label>
              <input
                id="auth-otp"
                type="text"
                value={otp}
                onChange={handleOtpChange}
                onBlur={() => handleBlur('otp')}
                placeholder="e.g. 123456"
                maxLength={6}
                autoFocus
                style={fieldErrors.otp && touched.otp ? { ...styles.input, ...styles.inputError } : styles.input}
                required
              />
              {touched.otp && fieldErrors.otp && (
                <span style={styles.fieldErrorText}>{fieldErrors.otp}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isOtpDisabled}
              style={isOtpDisabled ? { ...styles.submitButton, ...styles.buttonDisabled } : styles.submitButton}
            >
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </button>

            <button
              type="button"
              onClick={() => setIsAwaitingOtp(false)}
              style={styles.backButton}
            >
              ← Edit Registration Details
            </button>
          </form>
        ) : isSignUp ? (
          /* SIGNUP STEP */
          <form onSubmit={handleSignupSubmit} style={styles.form} noValidate>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="signup-name">Full Name</label>
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={handleNameChange}
                onBlur={() => handleBlur('name')}
                placeholder="e.g. Aadil"
                style={fieldErrors.name && touched.name ? { ...styles.input, ...styles.inputError } : styles.input}
                required
              />
              {touched.name && fieldErrors.name && (
                <span style={styles.fieldErrorText}>{fieldErrors.name}</span>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="auth-email">Email Address</label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={() => handleBlur('email')}
                placeholder="e.g. student@nitt.edu"
                style={fieldErrors.email && touched.email ? { ...styles.input, ...styles.inputError } : styles.input}
                required
              />
              {touched.email && fieldErrors.email && (
                <span style={styles.fieldErrorText}>{fieldErrors.email}</span>
              )}
            </div>

            <div style={styles.formGroup}>
              <div style={styles.labelRow}>
                <label style={styles.label} htmlFor="auth-password">Password</label>
                <button
                  type="button"
                  onClick={() => setShowPasswordRequirements((prev) => !prev)}
                  style={styles.reqToggleBtn}
                  aria-label="Toggle password requirements"
                  title="Toggle password requirements"
                >
                  <span style={styles.helpBadge}>?</span> Password requirements
                </button>
              </div>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => handleBlur('password')}
                placeholder="••••••••"
                style={fieldErrors.password && touched.password ? { ...styles.input, ...styles.inputError } : styles.input}
                required
              />

              {showPasswordRequirements && (
                <div style={styles.tooltipCard}>
                  <div style={styles.tooltipHeading}>Password requirements:</div>
                  <p style={styles.tooltipText}>
                    At least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character
                  </p>
                  <div style={styles.requirementsChecklist}>
                    <div style={criteria.length ? styles.reqMet : styles.reqUnmet}>
                      {criteria.length ? '✓' : '•'} At least 8 characters
                    </div>
                    <div style={criteria.uppercase ? styles.reqMet : styles.reqUnmet}>
                      {criteria.uppercase ? '✓' : '•'} One uppercase letter
                    </div>
                    <div style={criteria.lowercase ? styles.reqMet : styles.reqUnmet}>
                      {criteria.lowercase ? '✓' : '•'} One lowercase letter
                    </div>
                    <div style={criteria.digit ? styles.reqMet : styles.reqUnmet}>
                      {criteria.digit ? '✓' : '•'} One number
                    </div>
                    <div style={criteria.special ? styles.reqMet : styles.reqUnmet}>
                      {criteria.special ? '✓' : '•'} One special character (!@#$%^&*(),.?":{}|&lt;&gt;)
                    </div>
                  </div>
                </div>
              )}

              {password.length > 0 && (
                <div style={styles.strengthContainer}>
                  <div style={styles.strengthBarBg}>
                    <div
                      style={{
                        ...styles.strengthBarFill,
                        width: strengthInfo.width,
                        backgroundColor: strengthInfo.color
                      }}
                    />
                  </div>
                  <div style={{ ...styles.strengthLabel, color: strengthInfo.color }}>
                    Strength: <strong>{strengthInfo.label}</strong>
                  </div>
                </div>
              )}

              {touched.password && fieldErrors.password && (
                <span style={styles.fieldErrorText}>{fieldErrors.password}</span>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="signup-dept">Department</label>
              <select
                id="signup-dept"
                value={department}
                onChange={handleDepartmentChange}
                onBlur={() => handleBlur('department')}
                style={fieldErrors.department && touched.department ? { ...styles.select, ...styles.inputError } : styles.select}
                required
              >
                <option value="" disabled>-- Select Department --</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {touched.department && fieldErrors.department && (
                <span style={styles.fieldErrorText}>{fieldErrors.department}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSignupDisabled}
              style={isSignupDisabled ? { ...styles.submitButton, ...styles.buttonDisabled } : styles.submitButton}
            >
              {loading ? 'Sending Verification Code...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          /* LOGIN STEP */
          <form onSubmit={handleLoginSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="auth-email">Email Address</label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. student@nitt.edu"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={styles.input}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={loading ? { ...styles.submitButton, ...styles.buttonDisabled } : styles.submitButton}
            >
              {loading ? 'Signing In...' : 'Log In'}
            </button>
          </form>
        )}

        <div style={styles.footer}>
          <span style={styles.footerText}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </span>
          <button type="button" onClick={toggleMode} style={styles.toggleButton}>
            {isSignUp ? 'Log In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDFBF7',
    padding: '24px 16px',
    fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    color: '#1A1A2E'
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    backgroundColor: '#FFFFFF',
    border: '1.5px solid #EFE8DC',
    borderRadius: '16px',
    padding: '32px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  header: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  iconBadge: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    backgroundColor: '#F0EBE0',
    border: '1.5px solid #E4DCD0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.6rem',
    marginBottom: '12px'
  },
  title: {
    margin: 0,
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '1.85rem',
    fontWeight: 800,
    color: '#1A1A2E',
    letterSpacing: '-0.02em',
    lineHeight: 1.15
  },
  subtitle: {
    margin: '6px 0 0 0',
    fontSize: '0.9rem',
    color: '#7C7567',
    lineHeight: 1.4
  },
  errorBanner: {
    backgroundColor: '#FDF2F0',
    color: '#C53030',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '0.88rem',
    border: '1px solid #FED7D2',
    lineHeight: 1.4
  },
  successBanner: {
    backgroundColor: '#F0FDF4',
    color: '#15803D',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '0.88rem',
    border: '1px solid #BBF7D0',
    lineHeight: 1.4
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  labelRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  label: {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: '#475569'
  },
  reqToggleBtn: {
    background: 'none',
    border: 'none',
    color: '#FF5C4D',
    fontSize: '0.78rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: 0
  },
  helpBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '15px',
    height: '15px',
    borderRadius: '50%',
    backgroundColor: '#FF5C4D',
    color: '#FFFFFF',
    fontSize: '0.68rem',
    fontWeight: 700
  },
  tooltipCard: {
    backgroundColor: '#F7F3EB',
    border: '1px solid #E4DCD0',
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '0.8rem',
    color: '#475569',
    marginTop: '2px',
    lineHeight: 1.4
  },
  tooltipHeading: {
    fontWeight: 700,
    color: '#1A1A2E',
    marginBottom: '4px'
  },
  tooltipText: {
    margin: '0 0 6px 0',
    color: '#64748B',
    fontSize: '0.78rem'
  },
  requirementsChecklist: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px'
  },
  reqMet: {
    color: '#10B981',
    fontWeight: 600,
    fontSize: '0.76rem'
  },
  reqUnmet: {
    color: '#94A3B8',
    fontSize: '0.76rem'
  },
  input: {
    padding: '11px 14px',
    borderRadius: '10px',
    border: '1.5px solid #E4DCD0',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    color: '#1A1A2E',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
  },
  select: {
    padding: '11px 14px',
    borderRadius: '10px',
    border: '1.5px solid #E4DCD0',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    color: '#1A1A2E',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    cursor: 'pointer'
  },
  inputError: {
    borderColor: '#EF4444',
    boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.15)'
  },
  fieldErrorText: {
    color: '#DC2626',
    fontSize: '0.78rem',
    fontWeight: 500,
    marginTop: '2px',
    lineHeight: 1.3
  },
  strengthContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginTop: '4px'
  },
  strengthBarBg: {
    height: '6px',
    backgroundColor: '#EFE8DC',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.25s ease, background-color 0.25s ease'
  },
  strengthLabel: {
    fontSize: '0.78rem',
    fontWeight: 600,
    textAlign: 'right'
  },
  submitButton: {
    marginTop: '6px',
    padding: '13px',
    backgroundColor: '#FF5C4D',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'background-color 0.15s ease, transform 0.12s ease'
  },
  buttonDisabled: {
    opacity: 0.55,
    cursor: 'not-allowed'
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#7C7567',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    padding: '6px',
    textAlign: 'center',
    transition: 'color 0.15s ease'
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    paddingTop: '8px',
    borderTop: '1px solid #F0EBE0',
    fontSize: '0.88rem'
  },
  footerText: {
    color: '#7C7567'
  },
  toggleButton: {
    background: 'none',
    border: 'none',
    color: '#FF5C4D',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '0.88rem',
    padding: 0,
    textDecoration: 'underline'
  }
};
