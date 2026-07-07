import React, { useState, useEffect, useContext } from 'react';
import Modal from '@/shared/components/Modal/Modal';
import Button from '@/shared/components/Button/Button';
import Input from '@/shared/components/Form/Input';
import Select from '@/shared/components/Form/Select';
import CreatableSelect from '@/shared/components/Form/CreatableSelect';
import Textarea from '@/shared/components/Form/Textarea';
import FormField from '@/shared/components/Form/FormField';
import { useData } from '@/core/contexts/DataContext';
import { useIsMobile } from '@/core/hooks/useIsMobile';
import { useLazyMetiers } from '@/core/hooks/useLazyMetiers';
import { MISSION_STATUS_LABELS } from '@/config/constants';

const TEMPLATES_KEY = 'ats_mission_templates';

/**
 * Formulaire de création/édition de mission
 *
 * @example
 * <MissionForm
 *   mission={mission}
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   onSubmit={handleSubmit}
 * />
 */
export function MissionForm({ mission = null, isOpen, onClose, onSubmit }) {
  const isEditing = !!mission;
  const { team = [] } = useData();
  const isMobile = useIsMobile();
  const METIERS = useLazyMetiers();

  const [formData, setFormData] = useState({
    title: '',
    client: '',
    location: '',
    salary: '',
    status: 'open',
    skills: '',
    description: '',
    emoji: '💼',
    color: '#667EEA',
    notes: '',
    startDate: '',
    expectedCloseDate: '',
    urgency: '',
    street: '',
    city: '',
    zipCode: '',
    workMode: 'hybride',
    contractType: 'CDI',
    weeklyHours: '35 heures',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    progress: 0,
    allowedRecruiters: [],
    numberOfPositions: 1,
    maxApplications: '',
    screeningQuestions: [],
    testLink: '',
    evaluationCriteria: [],
  });

  const [errors, setErrors] = useState({});
  const [templates, setTemplates] = useState(() => {
    try { return JSON.parse(localStorage.getItem(TEMPLATES_KEY) || '[]'); } catch { return []; }
  });

  // Pré-remplir le formulaire en mode édition
  useEffect(() => {
    if (mission) {
      setFormData({
        title: mission.title || '',
        client: mission.client || '',
        location: mission.location || '',
        salary: mission.salary || '',
        status: mission.status || 'open',
        skills: Array.isArray(mission.skills) ? mission.skills.join(', ') : '',
        description: mission.description || '',
        emoji: mission.emoji || '💼',
        color: mission.color || '#667EEA',
        notes: mission.notes || '',
        startDate: mission.startDate || '',
        expectedCloseDate: mission.expectedCloseDate || '',
        urgency: mission.urgency || '',
        numberOfPositions: mission.numberOfPositions || 1,
        maxApplications: mission.maxApplications || '',
        screeningQuestions: mission.screeningQuestions || [],
        testLink: mission.testLink || '',
        evaluationCriteria: mission.evaluationCriteria || [],
        street: mission.address?.street || '',
        city: mission.address?.city || '',
        zipCode: mission.address?.zipCode || '',
        workMode: mission.workMode || 'hybride',
        contractType: mission.contractType || 'CDI',
        weeklyHours: mission.weeklyHours || '35 heures',
        contactName: mission.contactClient?.name || '',
        contactPhone: mission.contactClient?.phone || '',
        contactEmail: mission.contactClient?.email || '',
        progress: mission.progress || 0,
        allowedRecruiters: mission.allowedRecruiters || [],
      });
    } else {
      // Réinitialiser en mode création
      setFormData({
        title: '',
        client: '',
        location: '',
        salary: '',
        status: 'open',
        skills: '',
        description: '',
        emoji: '💼',
        color: '#667EEA',
        notes: '',
        startDate: '',
        urgency: '',
        street: '',
        city: '',
        zipCode: '',
        workMode: 'hybride',
        contractType: 'CDI',
        weeklyHours: '35 heures',
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        progress: 0,
        allowedRecruiters: [],
        numberOfPositions: 1,
        maxApplications: '',
        screeningQuestions: [],
        testLink: '',
        evaluationCriteria: [],
      });
    }
    setErrors({});
  }, [mission, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleLoadTemplate = (e) => {
    const idx = Number(e.target.value);
    if (isNaN(idx) || idx < 0) return;
    const tpl = templates[idx];
    if (!tpl) return;
    setFormData(prev => ({
      ...prev,
      title: tpl.title || prev.title,
      description: tpl.description || prev.description,
      skills: tpl.skills || prev.skills,
      salary: tpl.salary || prev.salary,
      contractType: tpl.contractType || prev.contractType,
      workMode: tpl.workMode || prev.workMode,
      weeklyHours: tpl.weeklyHours || prev.weeklyHours,
      urgency: tpl.urgency || prev.urgency,
    }));
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Le titre est requis';
    if (!formData.client.trim()) newErrors.client = 'Le client est requis';
    if (!formData.location.trim()) newErrors.location = 'La localisation est requise';
    if (!formData.salary.trim()) newErrors.salary = 'Le salaire est requis';
    if (!formData.numberOfPositions || parseInt(formData.numberOfPositions) < 1) newErrors.numberOfPositions = 'Au moins 1 poste est requis';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    // Empêcher le comportement par défaut si c'est un événement de formulaire
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (!validate()) {
      return;
    }

    // Transformer les données pour correspondre au format attendu
    const missionData = {
      ...(mission?.id ? { id: mission.id } : {}),
      title: formData.title,
      client: formData.client,
      location: formData.location,
      salary: formData.salary,
      status: formData.status,
      numberOfPositions: parseInt(formData.numberOfPositions) || 1,
      maxApplications: formData.maxApplications ? parseInt(formData.maxApplications) : null,
      skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
      description: formData.description,
      emoji: formData.emoji,
      color: formData.color,
      notes: formData.notes,
      // T-352 : ces colonnes sont de type `date` — une chaîne vide (valeur par
      // défaut quand le champ n'est pas rempli) fait échouer l'insert/update
      // avec Postgres 22007 "invalid input syntax for type date" ; seul `null`
      // est accepté pour "pas de date". Trouvé en testant réellement la
      // création d'une mission sans dates optionnelles renseignées.
      startDate: formData.startDate || null,
      expectedCloseDate: formData.expectedCloseDate || null,
      urgency: formData.urgency,
      address: {
        street: formData.street,
        city: formData.city,
        zipCode: formData.zipCode,
      },
      workMode: formData.workMode,
      contractType: formData.contractType,
      weeklyHours: formData.weeklyHours,
      contactClient: {
        name: formData.contactName,
        phone: formData.contactPhone,
        email: formData.contactEmail,
      },
      progress: parseInt(formData.progress) || 0,
      links: mission?.links || [],
      documents: mission?.documents || [],
      allowedRecruiters: formData.allowedRecruiters,
      screeningQuestions: formData.screeningQuestions,
      testLink: formData.testLink.trim(),
      evaluationCriteria: formData.evaluationCriteria,
    };

    onSubmit(missionData);
  };

  const formStyles = {
    display: 'grid',
    gap: '20px',
  };

  const twoColumnsStyles = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: '16px',
  };

  const sectionTitleStyles = {
    fontSize: '14px',
    fontWeight: '800',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginTop: '16px',
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: '2px solid #E5E7EB',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header onClose={onClose}>
        {isEditing ? '✏️ Modifier la mission' : '➕ Nouvelle mission'}
      </Modal.Header>

      <Modal.Body>
        <form onSubmit={handleSubmit} style={formStyles}>
          {/* Charger un modèle */}
          {!isEditing && templates.length > 0 && (
            <div style={{ marginBottom: '20px', padding: '12px 16px', background: '#EEF2FF', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#667EEA', whiteSpace: 'nowrap' }}>📋 Modèle :</span>
              <select
                onChange={handleLoadTemplate}
                defaultValue=""
                style={{ flex: 1, padding: '7px 10px', borderRadius: '8px', border: '1.5px solid #C7D2FE', fontSize: '13px', background: 'white', color: '#374151' }}
              >
                <option value="">— Choisir un modèle —</option>
                {templates.map((tpl, i) => (
                  <option key={i} value={i}>{tpl._templateName || tpl.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* Informations principales */}
          <div>
            <h3 style={sectionTitleStyles}>📋 Informations Générales</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <FormField label="Métier recherché *" error={errors.title}>
                <CreatableSelect
                  name="title"
                  value={formData.title}
                  options={METIERS}
                  onChange={handleChange}
                  placeholder="Ex: Développeur Full Stack"
                />
              </FormField>

              <div style={twoColumnsStyles}>
                <FormField label="Client *" error={errors.client}>
                  <Input
                    name="client"
                    value={formData.client}
                    onChange={handleChange}
                    placeholder="Ex: TechCorp"
                  />
                </FormField>

                <FormField label="Localisation *" error={errors.location}>
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Ex: Paris"
                  />
                </FormField>
              </div>

              <div style={twoColumnsStyles}>
                <FormField label="Salaire *" error={errors.salary}>
                  <Input
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="Ex: 50k-70k€"
                  />
                </FormField>

                <FormField label="Statut">
                  {/* T-368 : options alignées sur MISSION_STATUS (constants.js) — l'ancienne
                      liste ('open'/'closed'/'on_hold') ne couvrait pas 'filled'/'paused'/
                      'pending_approval'/'draft', des statuts réels (clôture auto T-243/244,
                      workflow d'approbation T-242) qui n'avaient alors aucune option
                      correspondante dans ce select. 'on_hold' n'existait nulle part ailleurs
                      dans l'app (filtres, labels, couleurs) et rendait la mission invisible
                      dans tous les filtres par statut si jamais sélectionné. */}
                  <Select name="status" value={formData.status} onChange={handleChange}>
                    {Object.entries(MISSION_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </Select>
                </FormField>
              </div>

              <div style={twoColumnsStyles}>
                <FormField label="Nombre de postes à pourvoir *" error={errors.numberOfPositions}>
                  <Input
                    type="number"
                    name="numberOfPositions"
                    min="1"
                    value={formData.numberOfPositions}
                    onChange={handleChange}
                  />
                </FormField>
              </div>

              <div style={twoColumnsStyles}>
                <FormField label="Date de début">
                  <Input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                  />
                </FormField>

                <FormField label="Date de clôture prévue">
                  <Input
                    type="date"
                    name="expectedCloseDate"
                    value={formData.expectedCloseDate}
                    onChange={handleChange}
                    style={{ borderColor: formData.expectedCloseDate && new Date(formData.expectedCloseDate) < new Date() ? '#EF4444' : undefined }}
                  />
                  {formData.expectedCloseDate && new Date(formData.expectedCloseDate) < new Date() && (
                    <div style={{ fontSize:'11px', color:'#EF4444', fontWeight:'700', marginTop:'4px' }}>Date dépassée</div>
                  )}
                </FormField>

                <FormField label="Urgence">
                  <Select name="urgency" value={formData.urgency} onChange={handleChange}>
                    <option value="">Normale</option>
                    <option value="urgent">Urgent</option>
                    <option value="tres urgent">Très urgent</option>
                  </Select>
                </FormField>
              </div>

              <div style={twoColumnsStyles}>
                <FormField label="Clôture auto après N candidatures (optionnel)">
                  <Input
                    type="number"
                    name="maxApplications"
                    min="1"
                    placeholder="Ex: 50"
                    value={formData.maxApplications}
                    onChange={handleChange}
                  />
                </FormField>
              </div>

              <div style={twoColumnsStyles}>
                <FormField label="Emoji">
                  <Input
                    name="emoji"
                    value={formData.emoji}
                    onChange={handleChange}
                    placeholder="💼"
                    maxLength={2}
                  />
                </FormField>

                <FormField label="Couleur">
                  <Input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                  />
                </FormField>
              </div>
            </div>
          </div>

          {/* Détails du contrat */}
          <div>
            <h3 style={sectionTitleStyles}>💼 Détails du Contrat</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={twoColumnsStyles}>
                <FormField label="Type de contrat">
                  <Select name="contractType" value={formData.contractType} onChange={handleChange}>
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Stage">Stage</option>
                    <option value="Alternance">Alternance</option>
                  </Select>
                </FormField>

                <FormField label="Mode de travail">
                  <Select name="workMode" value={formData.workMode} onChange={handleChange}>
                    <option value="sur site">Sur site</option>
                    <option value="hybride">Hybride</option>
                    <option value="total remote">100% Remote</option>
                  </Select>
                </FormField>
              </div>

              <FormField label="Horaires hebdomadaires">
                <Input
                  name="weeklyHours"
                  value={formData.weeklyHours}
                  onChange={handleChange}
                  placeholder="Ex: 35 heures"
                />
              </FormField>
            </div>
          </div>

          {/* Adresse */}
          <div>
            <h3 style={sectionTitleStyles}>📍 Adresse</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <FormField label="Rue">
                <Input
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="Ex: 45 Avenue des Champs-Élysées"
                />
              </FormField>

              <div style={twoColumnsStyles}>
                <FormField label="Ville">
                  <Input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Ex: Paris"
                  />
                </FormField>

                <FormField label="Code postal">
                  <Input
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    placeholder="Ex: 75008"
                  />
                </FormField>
              </div>
            </div>
          </div>

          {/* Contact client */}
          <div>
            <h3 style={sectionTitleStyles}>👤 Contact Client</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <FormField label="Nom du contact">
                <Input
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  placeholder="Ex: Marie Dubois"
                />
              </FormField>

              <div style={twoColumnsStyles}>
                <FormField label="Téléphone">
                  <Input
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    placeholder="Ex: +33140506070"
                  />
                </FormField>

                <FormField label="Email">
                  <Input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    placeholder="Ex: contact@client.com"
                  />
                </FormField>
              </div>
            </div>
          </div>

          {/* Description et compétences */}
          <div>
            <h3 style={sectionTitleStyles}>📝 Description</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <FormField label="Compétences requises (séparées par des virgules)">
                <Textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="Ex: React, Node.js, TypeScript, AWS"
                  rows={2}
                />
              </FormField>

              <FormField label="Description de la mission">
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Décrivez la mission..."
                  rows={4}
                />
              </FormField>

              <FormField label="Notes internes">
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Notes privées (non visibles par le client)"
                  rows={3}
                />
              </FormField>
            </div>
          </div>

          {/* Permissions recruteurs */}
          {team.length > 0 && (
            <div>
              <h3 style={sectionTitleStyles}>🔒 Accès recruteurs</h3>
              <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>
                Laissez vide pour un accès ouvert à toute l'équipe. Cochez pour restreindre la visibilité.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '8px' }}>
                {team.map(member => {
                  const checked = formData.allowedRecruiters.includes(member.id);
                  return (
                    <label key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: `2px solid ${checked ? '#667EEA' : '#E5E7EB'}`, borderRadius: '10px', cursor: 'pointer', background: checked ? '#EEF2FF' : 'white', transition: 'all 0.2s' }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setFormData(prev => ({
                            ...prev,
                            allowedRecruiters: checked
                              ? prev.allowedRecruiters.filter(id => id !== member.id)
                              : [...prev.allowedRecruiters, member.id],
                          }));
                        }}
                        style={{ accentColor: '#667EEA' }}
                      />
                      <span style={{ fontSize: '13px', fontWeight: '600', color: checked ? '#4338CA' : '#374151' }}>
                        {member.name}
                      </span>
                      <span style={{ fontSize: '11px', color: '#9CA3AF', marginLeft: 'auto' }}>{member.role}</span>
                    </label>
                  );
                })}
              </div>
              {formData.allowedRecruiters.length > 0 && (
                <p style={{ fontSize: '12px', color: '#667EEA', marginTop: '8px', fontWeight: '600' }}>
                  🔒 Mission restreinte à {formData.allowedRecruiters.length} recruteur{formData.allowedRecruiters.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}

          {/* Questions de pré-sélection (T-245) */}
          <div>
            <h3 style={sectionTitleStyles}>❓ Questions de pré-sélection (portail carrières)</h3>
            {formData.screeningQuestions.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
                {formData.screeningQuestions.map((q, i) => (
                  <div key={q.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '10px', background: '#F9FAFB', borderRadius: '8px', border: '1.5px solid #E5E7EB' }}>
                    <Input
                      value={q.question}
                      placeholder="Intitulé de la question"
                      onChange={e => {
                        const next = [...formData.screeningQuestions];
                        next[i] = { ...next[i], question: e.target.value };
                        setFormData(prev => ({ ...prev, screeningQuestions: next }));
                      }}
                      style={{ flex: 1 }}
                    />
                    <Select
                      value={q.type}
                      onChange={e => {
                        const next = [...formData.screeningQuestions];
                        next[i] = { ...next[i], type: e.target.value };
                        setFormData(prev => ({ ...prev, screeningQuestions: next }));
                      }}
                      style={{ width: '110px', flexShrink: 0 }}
                    >
                      <option value="yesno">Oui/Non</option>
                      <option value="text">Texte libre</option>
                    </Select>
                    {q.type === 'yesno' && (
                      <Select
                        value={q.requiredAnswer || 'yes'}
                        onChange={e => {
                          const next = [...formData.screeningQuestions];
                          next[i] = { ...next[i], requiredAnswer: e.target.value };
                          setFormData(prev => ({ ...prev, screeningQuestions: next }));
                        }}
                        style={{ width: '130px', flexShrink: 0 }}
                        title="Réponse attendue (non éliminatoire)"
                      >
                        <option value="yes">Attendu: Oui</option>
                        <option value="no">Attendu: Non</option>
                      </Select>
                    )}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6B7280', flexShrink: 0, whiteSpace: 'nowrap' }}>
                      <input
                        type="checkbox"
                        checked={!!q.eliminatory}
                        disabled={q.type !== 'yesno'}
                        onChange={e => {
                          const next = [...formData.screeningQuestions];
                          next[i] = { ...next[i], eliminatory: e.target.checked };
                          setFormData(prev => ({ ...prev, screeningQuestions: next }));
                        }}
                      />
                      Éliminatoire
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, screeningQuestions: prev.screeningQuestions.filter((_, idx) => idx !== i) }))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: '16px', flexShrink: 0 }}
                      title="Supprimer cette question"
                      aria-label="Supprimer cette question"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => setFormData(prev => ({
                ...prev,
                screeningQuestions: [...prev.screeningQuestions, { id: `q_${Date.now()}`, question: '', type: 'yesno', requiredAnswer: 'yes', eliminatory: false }],
              }))}
              style={{ padding: '8px 14px', background: '#EEF2FF', color: '#667EEA', border: '1.5px solid #C7D2FE', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
            >
              + Ajouter une question
            </button>
          </div>

          {/* Test de pré-qualification (T-246) */}
          <div>
            <h3 style={sectionTitleStyles}>🧪 Test de pré-qualification (optionnel)</h3>
            <FormField label="Lien vers un test externe (Testgorilla, AssessFirst…)">
              <Input
                type="url"
                name="testLink"
                placeholder="https://app.testgorilla.com/..."
                value={formData.testLink}
                onChange={handleChange}
              />
            </FormField>
            {formData.testLink && (
              <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '6px' }}>
                Ce lien sera proposé au candidat dans le formulaire de candidature. Le score sera à renseigner manuellement dans le pipeline une fois le résultat reçu.
              </p>
            )}
          </div>

          {/* Critères d'évaluation entretien (T-247) */}
          <div>
            <h3 style={sectionTitleStyles}>⭐ Critères d'évaluation entretien</h3>
            <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '10px' }}>
              Par défaut : Communication, Technique, Culture fit, Motivation, Leadership. Personnalisez si cette mission nécessite des critères spécifiques.
            </p>
            {formData.evaluationCriteria.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                {formData.evaluationCriteria.map((c, i) => (
                  <div key={c.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Input
                      value={c.name}
                      placeholder="Nom du critère"
                      onChange={e => {
                        const next = [...formData.evaluationCriteria];
                        next[i] = { ...next[i], name: e.target.value };
                        setFormData(prev => ({ ...prev, evaluationCriteria: next }));
                      }}
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, evaluationCriteria: prev.evaluationCriteria.filter((_, idx) => idx !== i) }))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: '16px' }}
                      title="Supprimer ce critère"
                      aria-label="Supprimer ce critère"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => setFormData(prev => ({
                ...prev,
                evaluationCriteria: [...prev.evaluationCriteria, { id: `c_${Date.now()}`, name: '' }],
              }))}
              style={{ padding: '8px 14px', background: '#EEF2FF', color: '#667EEA', border: '1.5px solid #C7D2FE', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
            >
              + Personnaliser les critères
            </button>
          </div>

          {/* Progression */}
          {isEditing && (
            <div>
              <h3 style={sectionTitleStyles}>📊 Progression</h3>
              <FormField label={`Avancement : ${formData.progress}%`}>
                <Input
                  type="range"
                  name="progress"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={handleChange}
                />
              </FormField>
            </div>
          )}
        </form>
      </Modal.Body>

      <Modal.Footer>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {isEditing ? '✅ Enregistrer' : '➕ Créer'}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default MissionForm;
