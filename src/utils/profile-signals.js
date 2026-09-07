const US_STATES = {
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR',
  california: 'CA', colorado: 'CO', connecticut: 'CT', delaware: 'DE',
  florida: 'FL', georgia: 'GA', hawaii: 'HI', idaho: 'ID',
  illinois: 'IL', indiana: 'IN', iowa: 'IA', kansas: 'KS',
  kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD',
  massachusetts: 'MA', michigan: 'MI', minnesota: 'MN', mississippi: 'MS',
  missouri: 'MO', montana: 'MT', nebraska: 'NE', nevada: 'NV',
  'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
  'north carolina': 'NC', 'north dakota': 'ND', ohio: 'OH', oklahoma: 'OK',
  oregon: 'OR', pennsylvania: 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', tennessee: 'TN', texas: 'TX', utah: 'UT',
  vermont: 'VT', virginia: 'VA', washington: 'WA', 'west virginia': 'WV',
  wisconsin: 'WI', wyoming: 'WY',
};

const CITY_TO_STATE = {
  'san francisco': 'CA', sf: 'CA', 'los angeles': 'CA', la: 'CA', 'san jose': 'CA',
  seattle: 'WA', 'new york city': 'NY', nyc: 'NY', brooklyn: 'NY',
  austin: 'TX', dallas: 'TX', houston: 'TX',
  chicago: 'IL', boston: 'MA', denver: 'CO', portland: 'OR',
  atlanta: 'GA', miami: 'FL', phoenix: 'AZ', minneapolis: 'MN',
  nashville: 'TN', raleigh: 'NC', charlotte: 'NC',
};

const STATE_ABBREVIATIONS = new Set(Object.values(US_STATES));
const GENERIC_TOPICS = new Set(['github', 'open-source', 'opensource', 'project', 'website']);
const ACRONYMS = new Map([
  ['ai', 'AI'], ['api', 'API'], ['cli', 'CLI'], ['css', 'CSS'], ['html', 'HTML'],
  ['ios', 'iOS'], ['mcp', 'MCP'], ['sdk', 'SDK'], ['ui', 'UI'], ['ux', 'UX'],
]);

function containsPhrase(value, phrase) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|[^a-z])${escaped}(?:$|[^a-z])`, 'i').test(value);
}

export function inferState(location) {
  if (!location) return null;

  const normalized = location
    .toLowerCase()
    .trim()
    .replace(/(?:,\s*|\s+)(?:usa|u\.s\.a\.|us|united states(?: of america)?)\s*$/i, '')
    .trim();

  const abbreviation = normalized.match(/(?:^|[\s,])([a-z]{2})\s*$/i)?.[1]?.toUpperCase();
  if (abbreviation && STATE_ABBREVIATIONS.has(abbreviation)) return abbreviation;

  if (/\b(?:washington\s*,?\s*d\.?c\.?|district of columbia)\b/i.test(normalized)) return 'DC';

  for (const [name, state] of Object.entries(US_STATES)) {
    if (containsPhrase(normalized, name)) return state;
  }

  for (const [city, state] of Object.entries(CITY_TO_STATE)) {
    if (containsPhrase(normalized, city)) return state;
  }

  return null;
}

export function computeStreak(activeDaySet, now = new Date()) {
  let streak = 0;
  for (let offset = 0; offset < 100; offset += 1) {
    const day = new Date(now);
    day.setUTCDate(day.getUTCDate() - offset);
    const key = day.toISOString().slice(0, 10);
    if (activeDaySet.has(key)) streak += 1;
    else if (offset > 0) break;
  }
  return streak;
}

function formatTopic(topic) {
  return topic
    .split('-')
    .filter(Boolean)
    .map((part) => ACRONYMS.get(part) ?? `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
    .join(' ');
}

export function inferTags(repos, limit = 3) {
  const counts = new Map();
  for (const repo of repos) {
    for (const rawTopic of repo.topics ?? []) {
      const topic = String(rawTopic).trim().toLowerCase();
      if (!topic || GENERIC_TOPICS.has(topic)) continue;
      counts.set(topic, (counts.get(topic) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort(([topicA, countA], [topicB, countB]) => countB - countA || topicA.localeCompare(topicB))
    .slice(0, limit)
    .map(([topic]) => formatTopic(topic));
}
