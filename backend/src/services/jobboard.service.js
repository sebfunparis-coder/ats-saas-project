/**
 * 🔗 Jobboard Service
 *
 * Abstraction layer pour la publication d'offres sur les jobboards.
 *
 * LinkedIn Jobs API : https://learn.microsoft.com/en-us/linkedin/talent/job-postings
 *   → Nécessite un partenariat LinkedIn Talent Solutions
 *   → OAuth2 avec scope r_liteprofile + w_member_social + rw_organization_admin
 *
 * Indeed Publisher API : https://ads.indeed.com/jobroll/xmlfeed
 *   → Nécessite un compte Indeed Publisher
 *   → Clé API + Publisher ID
 *
 * WTTJ (Welcome to the Jungle) API : partenariat direct requis
 */

import https from 'https';
import { publishToHelloWork, testHelloWork, publishToAPEC, testAPEC, publishToMonster, testMonster } from './jobboard-extension.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

const httpPost = (url, headers, body) =>
  new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const data = JSON.stringify(body);
    const req = https.request(
      {
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers },
      },
      res => {
        let raw = '';
        res.on('data', c => (raw += c));
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
          catch { resolve({ status: res.statusCode, body: raw }); }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });

const httpDelete = (url, headers) =>
  new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request(
      { hostname: parsed.hostname, path: parsed.pathname + parsed.search, method: 'DELETE', headers },
      res => { resolve({ status: res.statusCode }); }
    );
    req.on('error', reject);
    req.end();
  });

// ── Formatters ────────────────────────────────────────────────────────────────

const formatMissionForLinkedIn = (mission, companyName) => ({
  title: mission.title,
  description: mission.description || '',
  employmentType: {
    CDI: 'FULL_TIME',
    CDD: 'CONTRACT',
    Freelance: 'CONTRACTOR',
    Stage: 'INTERNSHIP',
  }[mission.contract] || 'FULL_TIME',
  location: {
    description: mission.location,
    country: 'FR',
  },
  companyName,
  externalJobPostingId: mission._id?.toString(),
  listingType: 'STANDARD',
  jobPostingOperationType: 'CREATE',
});

const formatMissionForIndeed = (mission, publisherId, companyName) => ({
  publisher: publisherId,
  v: '2',
  q: mission.title,
  l: mission.location,
  co: 'fr',
  highlight: '1',
  jobTitle: mission.title,
  company: companyName,
  city: mission.location,
  country: 'France',
  jobdescription: mission.description || '',
  jobtype: {
    CDI: 'fulltime',
    CDD: 'contract',
    Freelance: 'contract',
    Stage: 'internship',
  }[mission.contract] || 'fulltime',
});

// ── LinkedIn ─────────────────────────────────────────────────────────────────

export const publishToLinkedIn = async (mission, credentials, companyName) => {
  if (!credentials.accessToken) {
    throw new Error('Token LinkedIn manquant. Configurez l\'intégration LinkedIn dans les paramètres.');
  }

  const payload = formatMissionForLinkedIn(mission, companyName);

  const result = await httpPost(
    'https://api.linkedin.com/v2/jobPostings',
    {
      Authorization: `Bearer ${credentials.accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
    },
    payload
  );

  if (result.status !== 201 && result.status !== 200) {
    throw new Error(`LinkedIn API erreur ${result.status}: ${JSON.stringify(result.body)}`);
  }

  const externalId = result.body?.id || result.body?.jobPostingId || String(Date.now());
  const url = `https://www.linkedin.com/jobs/view/${externalId}`;
  return { externalJobId: String(externalId), url };
};

export const unpublishFromLinkedIn = async (externalJobId, credentials) => {
  if (!credentials.accessToken) throw new Error('Token LinkedIn manquant.');

  const result = await httpDelete(
    `https://api.linkedin.com/v2/jobPostings/${externalJobId}`,
    {
      Authorization: `Bearer ${credentials.accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
    }
  );

  if (result.status !== 200 && result.status !== 204) {
    throw new Error(`LinkedIn delete erreur ${result.status}`);
  }
};

export const testLinkedIn = async (credentials) => {
  if (!credentials.accessToken) throw new Error('Access token manquant.');

  const result = await new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.linkedin.com',
        path: '/v2/me',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      },
      res => resolve({ status: res.statusCode })
    );
    req.on('error', reject);
    req.end();
  });

  if (result.status !== 200) throw new Error(`LinkedIn API inaccessible (HTTP ${result.status})`);
  return true;
};

// ── Indeed ───────────────────────────────────────────────────────────────────

export const publishToIndeed = async (mission, credentials, companyName) => {
  if (!credentials.publisherId || !credentials.apiKey) {
    throw new Error('Publisher ID ou clé API Indeed manquants. Configurez l\'intégration Indeed.');
  }

  // Indeed Sponsored Jobs API: POST /v1/jobs
  const payload = {
    ...formatMissionForIndeed(mission, credentials.publisherId, companyName),
  };

  const result = await httpPost(
    'https://apis.indeed.com/v1/jobs',
    {
      Authorization: `Bearer ${credentials.apiKey}`,
      'Indeed-Publisher-ID': credentials.publisherId,
    },
    payload
  );

  if (result.status !== 200 && result.status !== 201) {
    throw new Error(`Indeed API erreur ${result.status}: ${JSON.stringify(result.body)}`);
  }

  const externalId = result.body?.jobId || result.body?.id || String(Date.now());
  const url = `https://www.indeed.fr/viewjob?jk=${externalId}`;
  return { externalJobId: String(externalId), url };
};

export const unpublishFromIndeed = async (externalJobId, credentials) => {
  if (!credentials.apiKey || !credentials.publisherId) throw new Error('Credentials Indeed manquants.');

  const result = await httpDelete(
    `https://apis.indeed.com/v1/jobs/${externalJobId}`,
    {
      Authorization: `Bearer ${credentials.apiKey}`,
      'Indeed-Publisher-ID': credentials.publisherId,
    }
  );

  if (result.status !== 200 && result.status !== 204) {
    throw new Error(`Indeed delete erreur ${result.status}`);
  }
};

export const testIndeed = async (credentials) => {
  if (!credentials.publisherId || !credentials.apiKey) {
    throw new Error('Publisher ID et clé API requis.');
  }

  const result = await new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'apis.indeed.com',
        path: `/v1/publisher?publisherId=${credentials.publisherId}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${credentials.apiKey}` },
      },
      res => resolve({ status: res.statusCode })
    );
    req.on('error', reject);
    req.end();
  });

  if (result.status !== 200) throw new Error(`Indeed API inaccessible (HTTP ${result.status})`);
  return true;
};

// ── WTTJ ─────────────────────────────────────────────────────────────────────

export const publishToWTTJ = async (mission, credentials, companyName) => {
  if (!credentials.apiKey) {
    throw new Error('Clé API Welcome to the Jungle manquante.');
  }

  const payload = {
    title: mission.title,
    description: mission.description || '',
    contract_type: { CDI: 'FULL_TIME', CDD: 'FIXED_TERM', Freelance: 'FREELANCE', Stage: 'INTERNSHIP' }[mission.contract] || 'FULL_TIME',
    remote: { 'Full remote': 'FULL', 'Hybride': 'PARTIAL', 'Sur site': 'NO' }[mission.remote] || 'NO',
    location: { city: mission.location, country_code: 'FR' },
    company_name: companyName,
    external_reference: mission._id?.toString(),
  };

  const result = await httpPost(
    'https://api.welcometothejungle.com/v1/jobs',
    { Authorization: `Bearer ${credentials.apiKey}` },
    payload
  );

  if (result.status !== 200 && result.status !== 201) {
    throw new Error(`WTTJ API erreur ${result.status}: ${JSON.stringify(result.body)}`);
  }

  const externalId = result.body?.uuid || result.body?.id || String(Date.now());
  const url = result.body?.url || `https://www.welcometothejungle.com/jobs/${externalId}`;
  return { externalJobId: String(externalId), url };
};

export const testWTTJ = async (credentials) => {
  if (!credentials.apiKey) throw new Error('Clé API manquante.');

  const result = await new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.welcometothejungle.com',
        path: '/v1/me',
        method: 'GET',
        headers: { Authorization: `Bearer ${credentials.apiKey}` },
      },
      res => resolve({ status: res.statusCode })
    );
    req.on('error', reject);
    req.end();
  });

  if (result.status !== 200) throw new Error(`WTTJ API inaccessible (HTTP ${result.status})`);
  return true;
};

// ── Dispatcher ────────────────────────────────────────────────────────────────

export const publishToJobboard = async (platform, mission, credentials, companyName) => {
  switch (platform) {
    case 'linkedin': return publishToLinkedIn(mission, credentials, companyName);
    case 'indeed':   return publishToIndeed(mission, credentials, companyName);
    case 'wttj':     return publishToWTTJ(mission, credentials, companyName);
    case 'hellowork': return publishToHelloWork(mission, credentials, companyName);
    case 'apec':      return publishToAPEC(mission, credentials, companyName);
    case 'monster':   return publishToMonster(mission, credentials, companyName);
    default: throw new Error(`Plateforme inconnue : ${platform}`);
  }
};

export const testJobboard = async (platform, credentials) => {
  switch (platform) {
    case 'linkedin': return testLinkedIn(credentials);
    case 'indeed':   return testIndeed(credentials);
    case 'wttj':     return testWTTJ(credentials);
    case 'hellowork': return testHelloWork(credentials);
    case 'apec':      return testAPEC(credentials);
    case 'monster':   return testMonster(credentials);
    default: throw new Error(`Plateforme inconnue : ${platform}`);
  }
};
