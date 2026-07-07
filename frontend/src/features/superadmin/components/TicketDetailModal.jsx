import React, { useState } from 'react';
import Modal from '@/shared/components/Modal/Modal';
import Button from '@/shared/components/Button/Button';
import Select from '@/shared/components/Form/Select';
import { useIsMobile } from '@/core/hooks/useIsMobile';

/**
 * Modal détail ticket support
 */
export function TicketDetailModal({ ticket, isOpen, onClose, onUpdate }) {
  const isMobile = useIsMobile();
  const [response, setResponse] = useState('');
  const [newStatus, setNewStatus] = useState(ticket?.status || 'open');
  const [newPriority, setNewPriority] = useState(ticket?.priority || 'medium');

  if (!ticket) return null;

  const handleSendResponse = () => {
    if (!response.trim()) {
      alert('⚠️ Veuillez écrire une réponse');
      return;
    }

    alert(`✅ Réponse envoyée à ${ticket.company}\n\nTicket #${ticket.id}\nRéponse: ${response}\n\n📧 Email envoyé au client avec succès !`);
    setResponse('');
  };

  const handleUpdateStatus = () => {
    onUpdate({ ...ticket, status: newStatus, priority: newPriority });
    alert(`✅ Ticket #${ticket.id} mis à jour\n\nNouveau statut: ${newStatus}\nNouvelle priorité: ${newPriority}`);
  };

  const conversations = [
    {
      from: ticket.company,
      message: ticket.subject,
      time: ticket.created,
      isCustomer: true
    },
    {
      from: 'Support Team',
      message: 'Nous avons bien reçu votre demande et travaillons sur une solution.',
      time: ticket.updated,
      isCustomer: false
    }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header onClose={onClose}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
          <div style={{ fontSize: '48px' }}>🎫</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#1F2937', marginBottom: '8px' }}>
              Ticket #{ticket.id}
            </h2>
            <div style={{ fontSize: '16px', color: '#6B7280', fontWeight: '600' }}>
              {ticket.company} • {ticket.subject}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{
              padding: '6px 12px',
              background: ticket.priority === 'high' ? '#EF4444' : ticket.priority === 'medium' ? '#F59E0B' : '#6B7280',
              color: 'white',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '700'
            }}>
              {ticket.priority === 'high' ? '🔴 Urgent' : ticket.priority === 'medium' ? '🟡 Moyen' : '⚪ Bas'}
            </span>
            <span style={{
              padding: '6px 12px',
              background: ticket.status === 'open' ? '#EF444420' : ticket.status === 'in_progress' ? '#F59E0B20' : '#10B98120',
              color: ticket.status === 'open' ? '#EF4444' : ticket.status === 'in_progress' ? '#F59E0B' : '#10B981',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '700'
            }}>
              {ticket.status === 'open' ? 'Ouvert' : ticket.status === 'in_progress' ? 'En cours' : 'Résolu'}
            </span>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body>
        {/* Informations */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px', padding: '20px', background: '#F9FAFB', borderRadius: '12px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '4px' }}>Assigné à</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#1F2937' }}>👤 {ticket.assignedTo}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '4px' }}>Créé le</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#1F2937' }}>{ticket.created}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '4px' }}>Dernière MAJ</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#1F2937' }}>{ticket.updated}</div>
          </div>
        </div>

        {/* Conversation */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1F2937', marginBottom: '16px' }}>💬 Conversation</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', padding: '16px', background: '#F9FAFB', borderRadius: '12px' }}>
            {conversations.map((msg, i) => (
              <div
                key={i}
                style={{
                  padding: '16px',
                  background: msg.isCustomer ? 'white' : '#EFF6FF',
                  borderRadius: '12px',
                  borderLeft: `4px solid ${msg.isCustomer ? '#667EEA' : '#10B981'}`
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>
                    {msg.isCustomer ? '👤' : '🎧'} {msg.from}
                  </span>
                  <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{msg.time}</span>
                </div>
                <div style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6' }}>{msg.message}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Réponse */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1F2937', marginBottom: '12px' }}>✉️ Répondre</h3>
          <textarea
            placeholder="Écrivez votre réponse au client..."
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            rows={4}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical',
              marginBottom: '12px'
            }}
          />
          <button
            onClick={handleSendResponse}
            style={{
              padding: '12px 24px',
              background: '#667EEA',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '14px',
              width: '100%'
            }}>
            📧 Envoyer Réponse
          </button>
        </div>

        {/* Modifier statut */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1F2937', marginBottom: '12px' }}>⚙️ Modifier Ticket</h3>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Statut</label>
              <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                <option value="open">Ouvert</option>
                <option value="in_progress">En cours</option>
                <option value="resolved">Résolu</option>
                <option value="closed">Fermé</option>
              </Select>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Priorité</label>
              <Select value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
                <option value="urgent">Urgente</option>
              </Select>
            </div>
          </div>
          <button
            onClick={handleUpdateStatus}
            style={{
              padding: '12px 24px',
              background: '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '14px',
              width: '100%'
            }}>
            💾 Mettre à Jour
          </button>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', width: '100%' }}>
          <Button variant="secondary" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default TicketDetailModal;
