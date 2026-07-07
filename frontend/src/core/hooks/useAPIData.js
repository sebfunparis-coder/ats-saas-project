import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';

// Récupère le company_id de l'utilisateur connecté
async function getCompanyId() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('company_id').eq('id', user.id).single();
  return data?.company_id || null;
}

// T-258 — Toutes les entités ci-dessous sont passées de useState/useEffect
// manuels (fetch au mount, mise à jour locale post-mutation, aucun cache ni
// resynchronisation) à React Query : cache automatique (staleTime/retry
// configurés une seule fois dans core/lib/queryClient.js), refetch en
// arrière-plan au retour de focus/reconnexion, et invalidation de la query
// après chaque mutation réussie (la liste est rechargée depuis Supabase —
// source de vérité — plutôt que rafistolée localement comme avant).
//
// ⚠️ Les noms et formes de retour de chaque hook sont volontairement
// identiques à l'ancienne implémentation (mêmes clés : `missions`, `loading`,
// `error`, `reload`, `createX`/`updateX`/`deleteX`...) — DataContext.jsx et
// les ~83 fichiers qui consomment ces données via useData()/useMissions()/etc.
// n'ont pas besoin d'être modifiés, seule la couche interne change.

export function useAPIMissions() {
  const queryClient = useQueryClient();
  const queryKey = ['missions'];

  const { data: missions = [], isLoading: loading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const companyId = await getCompanyId();
      if (!companyId) return [];
      const { data, error: err } = await supabase
        .from('missions')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      if (err) throw err;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (missionData) => {
      const companyId = await getCompanyId();
      if (!companyId) throw new Error('Non connecté');
      const { data, error: err } = await supabase
        .from('missions')
        .insert({ ...missionData, company_id: companyId })
        .select()
        .single();
      if (err) throw err;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, missionData }) => {
      const { data, error: err } = await supabase
        .from('missions')
        .update({ ...missionData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (err) throw err;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error: err } = await supabase.from('missions').delete().eq('id', id);
      if (err) throw err;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    missions,
    loading,
    error: error?.message || null,
    reload: () => queryClient.invalidateQueries({ queryKey }),
    createMission: (missionData) => createMutation.mutateAsync(missionData),
    updateMission: (id, missionData) => updateMutation.mutateAsync({ id, missionData }),
    deleteMission: (id) => deleteMutation.mutateAsync(id),
  };
}

export function useAPICandidates() {
  const queryClient = useQueryClient();
  const queryKey = ['candidates'];

  const { data: candidates = [], isLoading: loading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const companyId = await getCompanyId();
      if (!companyId) return [];
      const { data, error: err } = await supabase
        .from('candidates')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      if (err) throw err;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (candidateData) => {
      const companyId = await getCompanyId();
      if (!companyId) throw new Error('Non connecté');
      const { data, error: err } = await supabase
        .from('candidates')
        .insert({ ...candidateData, company_id: companyId })
        .select()
        .single();
      if (err) throw err;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, candidateData }) => {
      const { data, error: err } = await supabase
        .from('candidates')
        .update({ ...candidateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (err) throw err;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error: err } = await supabase.from('candidates').delete().eq('id', id);
      if (err) throw err;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    candidates,
    loading,
    error: error?.message || null,
    reload: () => queryClient.invalidateQueries({ queryKey }),
    createCandidate: (candidateData) => createMutation.mutateAsync(candidateData),
    updateCandidate: (id, candidateData) => updateMutation.mutateAsync({ id, candidateData }),
    deleteCandidate: (id) => deleteMutation.mutateAsync(id),
  };
}

// applications utilise candidate_id/mission_id (snake_case) en base — normalisé
// en candidateId/missionId pour rester compatible avec tout le code existant
// (KanbanCard, CandidateDetail, MissionDetail, ApplicationDetail...).
function normalizeApplication(row) {
  if (!row) return row;
  return { ...row, candidateId: row.candidate_id, missionId: row.mission_id };
}

export function useAPIApplications() {
  const queryClient = useQueryClient();
  const queryKey = ['applications'];

  const { data: applications = [], isLoading: loading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const companyId = await getCompanyId();
      if (!companyId) return [];
      const { data, error: err } = await supabase
        .from('applications')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      if (err) throw err;
      return (data || []).map(normalizeApplication);
    },
  });

  const createMutation = useMutation({
    mutationFn: async (applicationData) => {
      const companyId = await getCompanyId();
      if (!companyId) throw new Error('Non connecté');
      const { candidateId, missionId, ...rest } = applicationData;
      const { data, error: err } = await supabase
        .from('applications')
        .insert({ ...rest, candidate_id: candidateId, mission_id: missionId, company_id: companyId })
        .select()
        .single();
      if (err) throw err;
      return normalizeApplication(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      const { candidateId, missionId, ...rest } = updates;
      const payload = {
        ...rest,
        ...(candidateId !== undefined && { candidate_id: candidateId }),
        ...(missionId !== undefined && { mission_id: missionId }),
        updated_at: new Date().toISOString(),
      };
      const { data, error: err } = await supabase
        .from('applications')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (err) throw err;
      return normalizeApplication(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error: err } = await supabase.from('applications').delete().eq('id', id);
      if (err) throw err;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const updateApplication = (id, updates) => updateMutation.mutateAsync({ id, updates });

  return {
    applications,
    loading,
    error: error?.message || null,
    reload: () => queryClient.invalidateQueries({ queryKey }),
    createApplication: (applicationData) => createMutation.mutateAsync(applicationData),
    updateApplication,
    updateApplicationStatus: (id, status) => updateApplication(id, { status }),
    deleteApplication: (id) => deleteMutation.mutateAsync(id),
  };
}

// evaluations utilise application_id/candidate_id/etc. (snake_case) en base —
// normalisé en camelCase pour rester compatible avec EvaluationModal.jsx/PipelinePage.jsx.
function normalizeEvaluation(row) {
  if (!row) return row;
  return {
    ...row,
    applicationId: row.application_id,
    candidateId: row.candidate_id,
    candidateName: row.candidate_name,
    missionTitle: row.mission_title,
    evaluatorId: row.evaluator_id,
    evaluatorName: row.evaluator_name,
    globalScore: row.global_score,
  };
}

export function useAPIEvaluations() {
  const queryClient = useQueryClient();
  const queryKey = ['evaluations'];

  const { data: evaluations = [], isLoading: loading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const companyId = await getCompanyId();
      if (!companyId) return [];
      const { data, error: err } = await supabase
        .from('evaluations')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      if (err) throw err;
      return (data || []).map(normalizeEvaluation);
    },
  });

  const createMutation = useMutation({
    mutationFn: async (evaluation) => {
      const companyId = await getCompanyId();
      if (!companyId) throw new Error('Non connecté');
      const { applicationId, candidateId, candidateName, missionTitle, evaluatorId, evaluatorName, globalScore, ...rest } = evaluation;
      const { data, error: err } = await supabase
        .from('evaluations')
        .insert({
          ...rest,
          application_id: applicationId,
          candidate_id: candidateId,
          candidate_name: candidateName,
          mission_title: missionTitle,
          evaluator_id: evaluatorId,
          evaluator_name: evaluatorName,
          global_score: globalScore,
          company_id: companyId,
        })
        .select()
        .single();
      if (err) throw err;
      return normalizeEvaluation(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      const { applicationId, candidateId, candidateName, missionTitle, evaluatorId, evaluatorName, globalScore, ...rest } = updates;
      const payload = {
        ...rest,
        ...(applicationId !== undefined && { application_id: applicationId }),
        ...(candidateId !== undefined && { candidate_id: candidateId }),
        ...(candidateName !== undefined && { candidate_name: candidateName }),
        ...(missionTitle !== undefined && { mission_title: missionTitle }),
        ...(evaluatorId !== undefined && { evaluator_id: evaluatorId }),
        ...(evaluatorName !== undefined && { evaluator_name: evaluatorName }),
        ...(globalScore !== undefined && { global_score: globalScore }),
        updated_at: new Date().toISOString(),
      };
      const { data, error: err } = await supabase
        .from('evaluations')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (err) throw err;
      return normalizeEvaluation(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error: err } = await supabase.from('evaluations').delete().eq('id', id);
      if (err) throw err;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    evaluations,
    loading,
    error: error?.message || null,
    reload: () => queryClient.invalidateQueries({ queryKey }),
    createEvaluation: (evaluation) => createMutation.mutateAsync(evaluation),
    updateEvaluation: (id, updates) => updateMutation.mutateAsync({ id, updates }),
    deleteEvaluation: (id) => deleteMutation.mutateAsync(id),
  };
}

// T-359 : `enabled` permet à un appelant (ex. AdminPage.jsx) de reporter le fetch
// tant qu'un guard de rôle n'est pas confirmé positif, sans changer l'appel par
// défaut ailleurs (DataContext.jsx continue d'appeler useAPIUsers() sans argument).
export function useAPIUsers(enabled = true) {
  const queryClient = useQueryClient();
  const queryKey = ['users'];

  const { data: users = [], isLoading: loading, error } = useQuery({
    queryKey,
    enabled,
    queryFn: async () => {
      const companyId = await getCompanyId();
      if (!companyId) return [];
      const { data, error: err } = await supabase
        .from('profiles')
        .select('*')
        .eq('company_id', companyId);
      if (err) throw err;
      return data || [];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, userData }) => {
      const { data, error: err } = await supabase.from('profiles').update(userData).eq('id', id).select().single();
      if (err) throw err;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }) => {
      const { data, error: err } = await supabase.from('profiles').update({ role }).eq('id', id).select().single();
      if (err) throw err;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error: err } = await supabase.from('profiles').delete().eq('id', id);
      if (err) throw err;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    users,
    loading,
    error: error?.message || null,
    reload: () => queryClient.invalidateQueries({ queryKey }),
    updateUser: (id, userData) => updateMutation.mutateAsync({ id, userData }),
    updateUserRole: (id, role) => updateRoleMutation.mutateAsync({ id, role }),
    deleteUser: (id) => deleteMutation.mutateAsync(id),
  };
}

export function useAPIClients() {
  const queryClient = useQueryClient();
  const queryKey = ['clients'];

  const { data: clients = [], isLoading: loading } = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const companyId = await getCompanyId();
        if (!companyId) return [];
        const { data, error: err } = await supabase
          .from('clients')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false });
        if (err) throw err;
        return data || [];
      } catch {
        // Table inexistante ou non connecté — fallback sur localStorage (géré par DataContext)
        return [];
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (clientData) => {
      const companyId = await getCompanyId();
      if (!companyId) throw new Error('Non connecté');
      const { data, error: err } = await supabase
        .from('clients')
        .insert({ ...clientData, company_id: companyId })
        .select().single();
      if (err) throw err;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data, error: err } = await supabase
        .from('clients')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id).select().single();
      if (err) throw err;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error: err } = await supabase.from('clients').delete().eq('id', id);
      if (err) throw err;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    clients,
    loading,
    reload: () => queryClient.invalidateQueries({ queryKey }),
    createClient: (clientData) => createMutation.mutateAsync(clientData),
    updateClient: (id, updates) => updateMutation.mutateAsync({ id, updates }),
    deleteClient: (id) => deleteMutation.mutateAsync(id),
  };
}

function normalizeEvent(e) {
  if (!e) return e;
  return {
    ...e,
    candidateId: e.candidate_id,
    missionId: e.mission_id,
    emailReminder: e.email_reminder,
    visioUrl: e.visio_url,
    createdAt: e.created_at,
  };
}

export function useAPIEvents() {
  const queryClient = useQueryClient();
  const queryKey = ['events'];

  const { data: events = [], isLoading: loading } = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const companyId = await getCompanyId();
        if (!companyId) return [];
        const { data, error: err } = await supabase
          .from('events')
          .select('*')
          .eq('company_id', companyId)
          .order('date', { ascending: true });
        if (err) throw err;
        return (data || []).map(normalizeEvent);
      } catch {
        // Table/colonnes non migrées — fallback localStorage géré par DataContext
        return [];
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (eventData) => {
      const companyId = await getCompanyId();
      if (!companyId) throw new Error('Non connecté');
      const payload = {
        company_id: companyId,
        title: eventData.title,
        type: eventData.type || 'meeting',
        date: eventData.date,
        time: eventData.time || null,
        duration: eventData.duration ? Number(eventData.duration) : 60,
        description: eventData.description || '',
        location: eventData.location || '',
        participants: eventData.participants || '',
        candidate_id: eventData.candidateId || null,
        mission_id: eventData.missionId || null,
        reminder: eventData.reminder != null ? Number(eventData.reminder) : 30,
        email_reminder: !!eventData.emailReminder,
        notes: eventData.notes || '',
        visio_url: eventData.visioUrl || '',
        status: eventData.status || 'scheduled',
      };
      const { data, error: err } = await supabase.from('events').insert(payload).select().single();
      if (err) throw err;
      return normalizeEvent(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      const payload = {
        ...(updates.title !== undefined && { title: updates.title }),
        ...(updates.type !== undefined && { type: updates.type }),
        ...(updates.date !== undefined && { date: updates.date }),
        ...(updates.time !== undefined && { time: updates.time }),
        ...(updates.duration !== undefined && { duration: Number(updates.duration) }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.location !== undefined && { location: updates.location }),
        ...(updates.participants !== undefined && { participants: updates.participants }),
        ...(updates.candidateId !== undefined && { candidate_id: updates.candidateId || null }),
        ...(updates.missionId !== undefined && { mission_id: updates.missionId || null }),
        ...(updates.reminder !== undefined && { reminder: Number(updates.reminder) }),
        ...(updates.emailReminder !== undefined && { email_reminder: !!updates.emailReminder }),
        ...(updates.notes !== undefined && { notes: updates.notes }),
        ...(updates.visioUrl !== undefined && { visio_url: updates.visioUrl }),
        ...(updates.status !== undefined && { status: updates.status }),
        updated_at: new Date().toISOString(),
      };
      const { data, error: err } = await supabase.from('events').update(payload).eq('id', id).select().single();
      if (err) throw err;
      return normalizeEvent(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error: err } = await supabase.from('events').delete().eq('id', id);
      if (err) throw err;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    events,
    loading,
    reload: () => queryClient.invalidateQueries({ queryKey }),
    createEvent: (eventData) => createMutation.mutateAsync(eventData),
    updateEvent: (id, updates) => updateMutation.mutateAsync({ id, updates }),
    deleteEvent: (id) => deleteMutation.mutateAsync(id),
  };
}

export function useAPITasks() {
  const queryClient = useQueryClient();
  const queryKey = ['tasks'];

  const { data: tasks = [], isLoading: loading } = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const companyId = await getCompanyId();
        if (!companyId) return [];
        const { data, error: err } = await supabase
          .from('tasks')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false });
        if (err) throw err;
        return data || [];
      } catch {
        // Table inexistante — fallback localStorage
        return [];
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (taskData) => {
      const companyId = await getCompanyId();
      if (!companyId) throw new Error('Non connecté');
      const payload = {
        company_id: companyId,
        title: taskData.title,
        description: taskData.description || '',
        due_date: taskData.dueDate || null,
        priority: taskData.priority || 'medium',
        status: taskData.status || 'pending',
        assigned_to: taskData.assignedTo || null,
        related_to: taskData.relatedTo || null,
      };
      const { data, error: err } = await supabase.from('tasks').insert(payload).select().single();
      if (err) throw err;
      return { ...data, id: data.id, dueDate: data.due_date, assignedTo: data.assigned_to, relatedTo: data.related_to };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      const payload = {
        ...(updates.title !== undefined && { title: updates.title }),
        ...(updates.description !== undefined && { description: updates.description }),
        // T-352 : due_date est une colonne `date` — une chaîne vide (ex. champ
        // vidé par l'utilisateur) fait échouer l'update avec Postgres 22007.
        ...(updates.dueDate !== undefined && { due_date: updates.dueDate || null }),
        ...(updates.priority !== undefined && { priority: updates.priority }),
        ...(updates.status !== undefined && { status: updates.status }),
        ...(updates.assignedTo !== undefined && { assigned_to: updates.assignedTo }),
        ...(updates.relatedTo !== undefined && { related_to: updates.relatedTo }),
        updated_at: new Date().toISOString(),
      };
      const { data, error: err } = await supabase.from('tasks').update(payload).eq('id', id).select().single();
      if (err) throw err;
      return { ...data, id: data.id, dueDate: data.due_date, assignedTo: data.assigned_to, relatedTo: data.related_to };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error: err } = await supabase.from('tasks').delete().eq('id', id);
      if (err) throw err;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    tasks,
    loading,
    reload: () => queryClient.invalidateQueries({ queryKey }),
    createTask: (taskData) => createMutation.mutateAsync(taskData),
    updateTask: (id, updates) => updateMutation.mutateAsync({ id, updates }),
    deleteTask: (id) => deleteMutation.mutateAsync(id),
  };
}

function normalizeTeamMember(m) {
  if (!m) return m;
  return {
    ...m,
    firstName: m.first_name,
    lastName: m.last_name,
    name: `${m.first_name} ${m.last_name}`,
    hireDate: m.hire_date,
    companyId: m.company_id,
    profileId: m.profile_id,
  };
}

export function useAPITeam() {
  const queryClient = useQueryClient();
  const queryKey = ['team'];

  const { data: team = [], isLoading: loading } = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const companyId = await getCompanyId();
        if (!companyId) return [];
        const { data, error: err } = await supabase
          .from('team_members')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: true });
        if (err) throw err;
        return (data || []).map(normalizeTeamMember);
      } catch {
        // Table inexistante — fallback localStorage
        return [];
      }
    },
  });

  const addMutation = useMutation({
    mutationFn: async (memberData) => {
      const companyId = await getCompanyId();
      if (!companyId) throw new Error('Non connecté');
      const { data, error: err } = await supabase
        .from('team_members')
        .insert({
          company_id: companyId,
          first_name: memberData.firstName || memberData.first_name || '',
          last_name: memberData.lastName || memberData.last_name || '',
          email: memberData.email,
          phone: memberData.phone,
          role: memberData.role || 'recruiter',
          avatar: memberData.avatar,
          color: memberData.color,
          active: memberData.active !== false,
          hire_date: memberData.hireDate || memberData.hire_date || memberData.joinDate || null,
          permissions: memberData.permissions || ['read'],
          stats: memberData.stats || {},
          department: memberData.department || null,
        })
        .select().single();
      if (err) throw err;
      return normalizeTeamMember(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      const payload = {
        ...(updates.firstName !== undefined && { first_name: updates.firstName }),
        ...(updates.lastName !== undefined && { last_name: updates.lastName }),
        ...(updates.email !== undefined && { email: updates.email }),
        ...(updates.phone !== undefined && { phone: updates.phone }),
        ...(updates.role !== undefined && { role: updates.role }),
        ...(updates.avatar !== undefined && { avatar: updates.avatar }),
        ...(updates.color !== undefined && { color: updates.color }),
        ...(updates.active !== undefined && { active: updates.active }),
        ...(updates.hireDate !== undefined && { hire_date: updates.hireDate }),
        ...(updates.joinDate !== undefined && { hire_date: updates.joinDate }),
        ...(updates.permissions !== undefined && { permissions: updates.permissions }),
        ...(updates.stats !== undefined && { stats: updates.stats }),
        ...(updates.department !== undefined && { department: updates.department }),
        updated_at: new Date().toISOString(),
      };
      const { data, error: err } = await supabase.from('team_members').update(payload).eq('id', id).select().single();
      if (err) throw err;
      return normalizeTeamMember(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const removeMutation = useMutation({
    mutationFn: async (id) => {
      const { error: err } = await supabase.from('team_members').delete().eq('id', id);
      if (err) throw err;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    team,
    loading,
    reload: () => queryClient.invalidateQueries({ queryKey }),
    addTeamMember: (memberData) => addMutation.mutateAsync(memberData),
    updateTeamMember: (id, updates) => updateMutation.mutateAsync({ id, updates }),
    removeTeamMember: (id) => removeMutation.mutateAsync(id),
  };
}

export default { useAPIMissions, useAPICandidates, useAPIApplications, useAPIEvaluations, useAPIUsers, useAPIClients, useAPIEvents, useAPITasks, useAPITeam };
