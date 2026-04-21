import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

/**
 * Page d'inscription - Étape 1 : Informations personnelles
 */
export function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'Le prénom est requis';
    if (!formData.lastName.trim()) newErrors.lastName = 'Le nom est requis';
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    if (!formData.company.trim()) newErrors.company = 'Le nom de l\'entreprise est requis';
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    // Simuler un délai d'API
    await new Promise(resolve => setTimeout(resolve, 500));

    // Sauvegarder les données dans sessionStorage pour les étapes suivantes
    sessionStorage.setItem('registrationData', JSON.stringify(formData));

    // Rediriger vers la page de choix de plan
    navigate(ROUTES.REGISTER_PLAN);
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #E5E7EB',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '500',
    outline: 'none',
    transition: 'all 0.3s',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '700',
    color: '#374151',
    marginBottom: '8px'
  };

  const errorStyle = {
    color: '#DC2626',
    fontSize: '13px',
    marginTop: '4px',
    fontWeight: '600'
  };

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background animation */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.1 }}>
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '2px',
              height: '100%',
              background: 'linear-gradient(180deg, transparent 0%, white 50%, transparent 100%)',
              left: `${i * 8}%`,
              animation: `pulse ${2 + i * 0.1}s ease-in-out infinite`
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      {/* Registration Card */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        background: 'white',
        borderRadius: '24px',
        padding: '50px',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚀</div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '900',
            background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px'
          }}>
            Créez votre compte
          </h1>
          <p style={{
            fontSize: '15px',
            color: '#6B7280',
            fontWeight: '500'
          }}>
            Commencez gratuitement dès aujourd'hui
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '32px'
        }}>
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                background: step === 1
                  ? 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)'
                  : '#E5E7EB'
              }}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name Fields */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={labelStyle}>Prénom *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Jean"
                style={{
                  ...inputStyle,
                  borderColor: errors.firstName ? '#DC2626' : '#E5E7EB'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = errors.firstName ? '#DC2626' : '#667EEA'}
                onBlur={(e) => e.currentTarget.style.borderColor = errors.firstName ? '#DC2626' : '#E5E7EB'}
              />
              {errors.firstName && <div style={errorStyle}>{errors.firstName}</div>}
            </div>

            <div>
              <label style={labelStyle}>Nom *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Dupont"
                style={{
                  ...inputStyle,
                  borderColor: errors.lastName ? '#DC2626' : '#E5E7EB'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = errors.lastName ? '#DC2626' : '#667EEA'}
                onBlur={(e) => e.currentTarget.style.borderColor = errors.lastName ? '#DC2626' : '#E5E7EB'}
              />
              {errors.lastName && <div style={errorStyle}>{errors.lastName}</div>}
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Email professionnel *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="jean.dupont@entreprise.com"
              style={{
                ...inputStyle,
                borderColor: errors.email ? '#DC2626' : '#E5E7EB'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = errors.email ? '#DC2626' : '#667EEA'}
              onBlur={(e) => e.currentTarget.style.borderColor = errors.email ? '#DC2626' : '#E5E7EB'}
            />
            {errors.email && <div style={errorStyle}>{errors.email}</div>}
          </div>

          {/* Company */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Entreprise *</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Ma Super Entreprise"
              style={{
                ...inputStyle,
                borderColor: errors.company ? '#DC2626' : '#E5E7EB'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = errors.company ? '#DC2626' : '#667EEA'}
              onBlur={(e) => e.currentTarget.style.borderColor = errors.company ? '#DC2626' : '#E5E7EB'}
            />
            {errors.company && <div style={errorStyle}>{errors.company}</div>}
          </div>

          {/* Phone */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Téléphone (optionnel)</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+33 6 12 34 56 78"
              style={inputStyle}
              onFocus={(e) => e.currentTarget.style.borderColor = '#667EEA'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Mot de passe *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              style={{
                ...inputStyle,
                borderColor: errors.password ? '#DC2626' : '#E5E7EB'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = errors.password ? '#DC2626' : '#667EEA'}
              onBlur={(e) => e.currentTarget.style.borderColor = errors.password ? '#DC2626' : '#E5E7EB'}
            />
            {errors.password && <div style={errorStyle}>{errors.password}</div>}
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
              Minimum 6 caractères
            </div>
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '28px' }}>
            <label style={labelStyle}>Confirmer le mot de passe *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              style={{
                ...inputStyle,
                borderColor: errors.confirmPassword ? '#DC2626' : '#E5E7EB'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = errors.confirmPassword ? '#DC2626' : '#667EEA'}
              onBlur={(e) => e.currentTarget.style.borderColor = errors.confirmPassword ? '#DC2626' : '#E5E7EB'}
            />
            {errors.confirmPassword && <div style={errorStyle}>{errors.confirmPassword}</div>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '16px',
              background: isLoading
                ? 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)'
                : 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {isLoading ? '⏳ Chargement...' : '➡️ Continuer vers le choix du plan'}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: '28px',
          paddingTop: '24px',
          borderTop: '1px solid #E5E7EB',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>
            Vous avez déjà un compte ?
          </p>
          <button
            onClick={() => navigate(ROUTES.LOGIN)}
            style={{
              background: 'none',
              border: 'none',
              color: '#667EEA',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Se connecter →
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
