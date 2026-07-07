/**
 * Extension jobboard — T-269 (HelloWork, APEC, Monster)
 * Importé et réexporté par jobboard.service.js
 */

import https from 'https';

const httpPost = (hostname, path, headers, body) =>
  new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request(
      { hostname, path, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers } },
      res => { let raw = ''; res.on('data', c => (raw += c)); res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); } catch { resolve({ status: res.statusCode, body: raw }); } }); }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });

// ── HelloWork ──────────────────────────────────────────────────────────────────

export const publishToHelloWork = async (mission, credentials, companyName) => {
  if (!credentials.apiKey) throw new Error('Clé API HelloWork manquante. Partenariat requis : partners.hellowork.com');

  const result = await httpPost('api.hellowork.com', '/v1/jobs', { Authorization: `Bearer ${credentials.apiKey}` }, {
    title: mission.title,
    description: mission.description || '',
    company_name: companyName,
    contract_type: { CDI: 'CDI', CDD: 'CDD', Freelance: 'FREELANCE', Stage: 'STAGE', Alternance: 'ALTERNANCE' }[mission.contract] || 'CDI',
    location: mission.location || 'France',
    salary_min: mission.salaryMin || null,
    salary_max: mission.salaryMax || null,
    remote: { 'Full remote': 'full', 'Hybride': 'partial', 'Sur site': 'no' }[mission.remote] || 'no',
    external_reference: mission._id?.toString(),
  });

  if (result.status !== 200 && result.status !== 201) throw new Error(`HelloWork erreur ${result.status}: ${JSON.stringify(result.body)}`);

  const externalId = result.body?.id || result.body?.job_id || String(Date.now());
  return { externalJobId: String(externalId), url: result.body?.url || `https://www.hellowork.com/emploi/${externalId}.html` };
};

export const testHelloWork = async (credentials) => {
  if (!credentials.apiKey) throw new Error('Clé API HelloWork requise.');
  // Pas d'endpoint de ping officiel — retourne OK si la clé est présente
  return true;
};

// ── APEC ───────────────────────────────────────────────────────────────────────

export const publishToAPEC = async (mission, credentials, companyName) => {
  if (!credentials.partnerId || !credentials.apiKey) throw new Error('Partner ID et clé API APEC requis. Partenariat : apec.fr/partenaires');

  const result = await httpPost('api.apec.fr', '/v1/offers',
    { Authorization: `Bearer ${credentials.apiKey}`, 'X-Partner-ID': credentials.partnerId },
    {
      title: mission.title,
      description: mission.description || '',
      company: { name: companyName },
      contract: { type: mission.contract || 'CDI' },
      location: { label: mission.location, country: 'France' },
      salary: (mission.salaryMin && mission.salaryMax) ? { min: mission.salaryMin, max: mission.salaryMax, currency: 'EUR' } : null,
      externalId: mission._id?.toString(),
    }
  );

  if (result.status !== 200 && result.status !== 201) throw new Error(`APEC erreur ${result.status}: ${JSON.stringify(result.body)}`);

  const externalId = result.body?.id || String(Date.now());
  return {
    externalJobId: String(externalId),
    url: result.body?.url || `https://www.apec.fr/candidat/recherche-emploi.html/emploi/detail-offre/${externalId}`,
  };
};

export const testAPEC = async (credentials) => {
  if (!credentials.apiKey || !credentials.partnerId) throw new Error('Partner ID et clé API APEC requis.');
  return true;
};

// ── Monster ────────────────────────────────────────────────────────────────────

export const publishToMonster = async (mission, credentials, companyName) => {
  if (!credentials.username || !credentials.password) throw new Error('Identifiants Monster requis (compte Business).');

  const basicAuth = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');

  const result = await httpPost('api.monster.com', '/jobs/v2',
    { Authorization: `Basic ${basicAuth}` },
    {
      job: {
        referenceNumber: mission._id?.toString(),
        title: mission.title,
        body: mission.description || '',
        company: { name: companyName },
        locations: [{ city: mission.location || '', country: { code: 'FR' } }],
        jobType: { name: { CDI: 'Full Time', CDD: 'Contract', Stage: 'Internship' }[mission.contract] || 'Full Time' },
      },
    }
  );

  if (result.status !== 200 && result.status !== 201) throw new Error(`Monster erreur ${result.status}: ${JSON.stringify(result.body)}`);

  const externalId = result.body?.jobId || result.body?.id || String(Date.now());
  return { externalJobId: String(externalId), url: result.body?.viewJobUrl || `https://www.monster.fr/emploi/${externalId}` };
};

export const testMonster = async (credentials) => {
  if (!credentials.username || !credentials.password) throw new Error('Identifiants Monster requis.');
  return true;
};
