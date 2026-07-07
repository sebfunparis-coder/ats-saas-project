import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getAvailabilityLink, bookAvailabilitySlot } from '@/core/utils/availabilityLink';

function formatDateFr(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

/**
 * T-426 : lecture/réservation via les fonctions SECURITY DEFINER
 * get_availability_link/book_availability_slot (migration 035) — plus de
 * localStorage, le candidat ouvre ce lien sur son propre appareil.
 */
export function AvailabilityPage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [step, setStep] = useState('pick'); // 'pick' | 'confirm' | 'done' | 'notfound'
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await getAvailabilityLink(token);
        if (cancelled) return;
        if (!result) setNotFound(true);
        else setData(result);
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  // Hooks doivent s'exécuter avant tout retour anticipé (rules-of-hooks) —
  // sinon l'ordre des hooks change entre le rendu "lien introuvable" et le
  // rendu normal, ce que React ne supporte pas.
  const availableSlots = (data?.slots || []).filter((s) => !s.bookedBy);
  const slotsByDate = useMemo(() => {
    const map = {};
    availableSlots.forEach((s) => {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    });
    return map;
  }, [availableSlots]);

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #EEF2FF 0%, #F0FDF4 100%)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '40px 20px',
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
    padding: '40px',
    width: '100%',
    maxWidth: '600px',
  };

  if (loading) {
    return <div style={containerStyle}><div style={{ fontSize: '32px' }}>⏳</div></div>;
  }

  if (notFound || !data) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '20px', maxWidth: '420px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1F2937', marginBottom: '8px' }}>Lien introuvable</h2>
          <p style={{ color: '#6B7280' }}>Ce lien de disponibilité a expiré ou n'existe pas.</p>
        </div>
      </div>
    );
  }

  const handleBook = async () => {
    if (!name.trim() || !email.trim()) return;
    setBooking(true);
    setBookingError('');
    try {
      const success = await bookAvailabilitySlot({
        token,
        date: selectedSlot.date,
        time: selectedSlot.time,
        name: name.trim(),
        email: email.trim(),
      });
      if (!success) {
        setBookingError('Ce créneau vient d\'être réservé par quelqu\'un d\'autre. Merci d\'en choisir un autre.');
        // Recharger les créneaux à jour
        const refreshed = await getAvailabilityLink(token);
        if (refreshed) setData(refreshed);
        setStep('pick');
        return;
      }
      setStep('done');
    } catch (err) {
      setBookingError(`Une erreur est survenue : ${err.message}`);
    } finally {
      setBooking(false);
    }
  };

  if (step === 'done') {
    return (
      <div style={containerStyle}>
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <div style={{ fontSize: '72px', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#1F2937', marginBottom: '8px' }}>Créneau confirmé !</h2>
          <p style={{ color: '#6B7280', marginBottom: '24px' }}>
            Votre entretien est prévu le <strong>{formatDateFr(selectedSlot.date)}</strong> à <strong>{selectedSlot.time}</strong>.
          </p>
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
            <p style={{ color: '#166534', fontWeight: '600', margin: 0 }}>
              ✅ {data.recruiterName || 'Le recruteur'} vous contactera pour confirmer les détails.
            </p>
          </div>
          <p style={{ color: '#9CA3AF', fontSize: '13px' }}>Vous pouvez fermer cette page.</p>
        </div>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <button type="button" onClick={() => { setStep('pick'); setBookingError(''); }} style={{ background: 'none', border: 'none', color: '#667EEA', cursor: 'pointer', fontWeight: '600', marginBottom: '24px', fontSize: '14px' }}>
            ← Retour
          </button>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#1F2937', marginBottom: '8px' }}>Confirmer le créneau</h2>
          <div style={{ background: '#EEF2FF', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
            <p style={{ fontWeight: '700', color: '#4338CA', margin: 0 }}>
              📅 {formatDateFr(selectedSlot.date)} à {selectedSlot.time}
            </p>
            <p style={{ color: '#6B7280', fontSize: '13px', marginTop: '4px', marginBottom: 0 }}>
              Durée : {data.duration || 60} minutes
            </p>
          </div>
          {bookingError && (
            <div role="alert" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', fontWeight: '600' }}>
              {bookingError}
            </div>
          )}
          <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Votre nom *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alice Martin"
                style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Votre email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alice@exemple.com"
                style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>
          </div>
          <button
            onClick={handleBook}
            disabled={!name.trim() || !email.trim() || booking}
            style={{
              width: '100%', padding: '14px', background: (!name.trim() || !email.trim() || booking) ? '#E5E7EB' : 'linear-gradient(135deg, #667EEA, #764BA2)',
              color: (!name.trim() || !email.trim() || booking) ? '#9CA3AF' : 'white',
              border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '16px', cursor: (!name.trim() || !email.trim() || booking) ? 'default' : 'pointer',
            }}
          >
            {booking ? '⏳ Confirmation...' : '✅ Confirmer le créneau'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #667EEA, #764BA2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📅</div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#1F2937', margin: 0 }}>
                Planifier un entretien
              </h1>
              <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>
                avec {data.recruiterName || 'le recruteur'}
              </p>
            </div>
          </div>
          {data.note && (
            <p style={{ color: '#6B7280', fontSize: '14px', background: '#F9FAFB', padding: '12px', borderRadius: '10px', margin: 0 }}>{data.note}</p>
          )}
        </div>

        {availableSlots.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>😔</div>
            <p style={{ fontWeight: '600' }}>Plus aucun créneau disponible.</p>
            <p style={{ fontSize: '13px' }}>Contactez le recruteur directement.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {Object.entries(slotsByDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, slots]) => (
              <div key={date}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#667EEA', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                  {formatDateFr(date)}
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {slots.sort((a, b) => a.time.localeCompare(b.time)).map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => { setSelectedSlot(slot); setStep('confirm'); }}
                      style={{
                        padding: '10px 20px', background: '#EEF2FF', color: '#4338CA',
                        border: '2px solid #C7D2FE', borderRadius: '10px', cursor: 'pointer',
                        fontWeight: '700', fontSize: '14px', transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#667EEA'; e.currentTarget.style.color = 'white'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#EEF2FF'; e.currentTarget.style.color = '#4338CA'; }}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <p style={{ color: '#9CA3AF', fontSize: '12px', textAlign: 'center', marginTop: '32px' }}>
          Durée de chaque créneau : {data.duration || 60} minutes · Powered by ATS SaaS
        </p>
      </div>
    </div>
  );
}

export default AvailabilityPage;
