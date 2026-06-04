const { chromium } = require('playwright');
const fs = require('fs');

const chapters = [
  { url: 'https://bni-paris-rive-droite.fr/bienveillance-paris/fr/listemembre?chapterName=3743&regionIds=3660$isChapterwebsite', slug: 'bienveillance-paris', id: '3743' },
  { url: 'https://bni-paris-rive-droite.fr/performance-paris/fr/listemembre?chapterName=3724&regionIds=3660$isChapterwebsite', slug: 'performance-paris', id: '3724' },
  { url: 'https://bni-paris-rive-droite.fr/etoile-business-paris/fr/listemembre?chapterName=3725&regionIds=3660$isChapterwebsite', slug: 'etoile-business-paris', id: '3725' },
  { url: 'https://bni-paris-rive-droite.fr/paris-faubourg/fr/listedesmembres?chapterName=45251&regionIds=3660$isChapterwebsite', slug: 'paris-faubourg', id: '45251' },
  { url: 'https://bni-paris-rive-droite.fr/paris-merci/fr/listedesmembres?chapterName=45051&regionIds=3660$isChapterwebsite', slug: 'paris-merci', id: '45051' },
  { url: 'https://bni-paris-rive-droite.fr/waow-paris/fr/listemembre?chapterName=9550&regionIds=3660$isChapterwebsite', slug: 'waow-paris', id: '9550' },
  { url: 'https://bni-paris-rive-droite.fr/lets-go-paris/fr/memberlist?chapterName=32575&regionIds=3660$isChapterwebsite', slug: 'lets-go-paris', id: '32575' },
  { url: 'https://bni-paris-rive-droite.fr/success-paris/fr/listemembre?chapterName=3720&regionIds=3660$isChapterwebsite', slug: 'success-paris', id: '3720' },
  { url: 'https://bni-paris-rive-droite.fr/phoenix-paris/fr/listedesmembres?chapterName=28258&regionIds=3660$isChapterwebsite', slug: 'phoenix-paris', id: '28258' },
  { url: 'https://bni-paris-rive-droite.fr/osmose-co-paris/fr/listemembre?chapterName=14002&regionIds=3660$isChapterwebsite', slug: 'osmose-co-paris', id: '14002' },
  { url: 'https://bni-paris-rive-droite.fr/yes-paris/fr/listemembre?chapterName=19314&regionIds=3660$isChapterwebsite', slug: 'yes-paris', id: '19314' },
  { url: 'https://bni-paris-rive-droite.fr/paris-impact/fr/listedesmembres?chapterName=43562&regionIds=3660$isChapterwebsite', slug: 'paris-impact', id: '43562' },
  { url: 'https://bni-paris-rive-droite.fr/montmartre-paris/fr/listedesmembres?chapterName=15690&regionIds=3660$isChapterwebsite', slug: 'montmartre-paris', id: '15690' },
  { url: 'https://bni-paris-rive-droite.fr/convergences-paris/fr/listemembre?chapterName=9892&regionIds=3660$isChapterwebsite', slug: 'convergences-paris', id: '9892' },
  { url: 'https://bni-paris-rive-droite.fr/fr/chapterdetail?chapterId=ADu96FwJQJBss2FDk%2FHErQ%3D%3D&name=75D-51%20BNI%20Paris%20United', slug: 'paris-united', id: 'paris-united' },
  { url: 'https://bni-paris-rive-droite.fr/fides-paris/fr/listemembre?chapterName=3729&regionIds=3660$isChapterwebsite', slug: 'fides-paris', id: '3729' },
  { url: 'https://bni-paris-rive-droite.fr/croissance-paris/fr/listemembre?chapterName=3736&regionIds=3660$isChapterwebsite', slug: 'croissance-paris', id: '3736' },
  { url: 'https://bni-paris-rive-droite.fr/wake-up-paris/fr/listemembre?chapterName=30962&regionIds=3660$isChapterwebsite', slug: 'wake-up-paris', id: '30962' },
  { url: 'https://bni-paris-rive-droite.fr/and-you-paris/fr/listemembre?chapterName=10627&regionIds=3660$isChapterwebsite', slug: 'and-you-paris', id: '10627' },
  { url: 'https://bni-paris-rive-droite.fr/move-paris/fr/listedesmembres?chapterName=32269&regionIds=3660$isChapterwebsite', slug: 'move-paris', id: '32269' },
  { url: 'https://bni-paris-rive-droite.fr/best-%26-breakfast-paris/fr/listemembre?chapterName=3731&regionIds=3660$isChapterwebsite', slug: 'best-breakfast-paris', id: '3731' },
  { url: 'https://bni-paris-rive-droite.fr/synergies/fr/listemembre?chapterName=3740&regionIds=3660$isChapterwebsite', slug: 'synergies', id: '3740' },
  { url: 'https://bni-paris-rive-droite.fr/flash-paris/fr/listedesmembres?chapterName=39472&regionIds=3660$isChapterwebsite', slug: 'flash-paris', id: '39472' },
  { url: 'https://bni-paris-rive-droite.fr/la-sorbonne-paris/fr/listemembre?chapterName=3728&regionIds=3660$isChapterwebsite', slug: 'la-sorbonne-paris', id: '3728' },
  { url: 'https://bni-paris-rive-droite.fr/shine-paris/fr/listemembre?chapterName=15691&regionIds=3660$isChapterwebsite', slug: 'shine-paris', id: '15691' },
];

function extractChapterNameFromHeader(headerText, slug, sourceUrl) {
  // Special case: chapter name is in the URL query param
  const urlNameMatch = sourceUrl && sourceUrl.match(/[?&]name=([^&]+)/);
  if (urlNameMatch) {
    const decoded = decodeURIComponent(urlNameMatch[1]);
    if (decoded.match(/\d{2}[A-Z]?-\d+/)) return decoded;
  }
  // Header contains: "... BNI International 92-04 BNI Bienveillance - Paris [possibly more text]"
  // Match the chapter code + name pattern after last "BNI International"
  const afterBNI = headerText.split('BNI International').pop() || '';
  const match = afterBNI.match(/^\s*(\d{2}[A-Z]?-\d+\s+BNI\s+[^\n]+?)(?:\s+(?:Membres du Groupe|Liste des Membres|Détails du Groupe|$))/);
  if (match) return match[1].trim();
  // Simpler fallback: take everything from the chapter code
  // Also handles "BNI&You" style (no space after BNI)
  const codeMatch = afterBNI.match(/\s*(\d{2}[A-Z]?-\d+\s+BNI.+)/);
  if (codeMatch) return codeMatch[1].replace(/\s+(Membres du Groupe|Liste des Membres|Détails du Groupe).*/, '').trim();
  // Last fallback: slug to readable
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function parseSpecialty(rawSpecialty) {
  if (!rawSpecialty) return { category: '', subcategory: '', specialty: '' };
  const parts = rawSpecialty.split('>').map(s => s.trim());
  return {
    category: parts[0] || '',
    subcategory: parts[1] || '',
    specialty: parts[2] || parts[1] || '',
  };
}

async function scrapeChapter(page, chapterInfo) {
  console.log(`\nScraping [${chapterInfo.id}] ${chapterInfo.slug}...`);

  try {
    await page.goto(chapterInfo.url, { waitUntil: 'networkidle', timeout: 30000 });
  } catch (e) {
    try {
      await page.goto(chapterInfo.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    } catch (e2) {
      console.log(`  Failed: ${e2.message}`);
      return null;
    }
  }

  // Accept cookies
  try { await page.click('#CybotCookiebotDialogBodyButtonAccept', { timeout: 2000 }); } catch (e) {}
  await page.waitForTimeout(2000);

  // Wait for table data to load
  try { await page.waitForSelector('table td', { timeout: 10000 }); } catch (e) {}

  const data = await page.evaluate(() => {
    // Extract chapter name from header
    const header = document.querySelector('header');
    const headerText = header ? header.textContent.replace(/\s+/g, ' ').trim() : '';

    // Extract members from the table
    const rows = document.querySelectorAll('table tbody tr, table tr.odd, table tr.even');
    const members = [];

    rows.forEach(row => {
      const cells = Array.from(row.querySelectorAll('td'));
      if (cells.length < 2) return;

      const name = cells[0] ? cells[0].textContent.trim() : '';
      const company = cells[1] ? cells[1].textContent.trim() : '';
      const professionRaw = cells[2] ? cells[2].textContent.trim() : '';
      const phone = cells[3] ? cells[3].textContent.trim() : '';

      if (!name) return;

      // Parse name into first/last
      const nameParts = name.split(/\s+/);
      const lastName = nameParts.filter(p => p === p.toUpperCase() && p.length > 1).join(' ');
      const firstName = nameParts.filter(p => p !== p.toUpperCase() || p.length <= 1).join(' ');

      members.push({
        fullName: name,
        firstName: firstName || '',
        lastName: lastName || '',
        company: company || '',
        professionRaw: professionRaw,
        phone: phone || '',
      });
    });

    return { headerText, members };
  });

  const chapterName = extractChapterNameFromHeader(data.headerText, chapterInfo.slug, chapterInfo.url);

  // Parse profession data
  const members = data.members.map(m => {
    const parsed = parseSpecialty(m.professionRaw);
    return {
      fullName: m.fullName,
      firstName: m.firstName,
      lastName: m.lastName,
      company: m.company,
      professionCategory: parsed.category,
      professionSubcategory: parsed.subcategory,
      professionSpecialty: parsed.specialty,
      professionRaw: m.professionRaw,
      phone: m.phone,
    };
  });

  console.log(`  -> "${chapterName}" | ${members.length} membres`);

  return {
    chapterId: chapterInfo.id,
    chapterSlug: chapterInfo.slug,
    chapterName,
    sourceUrl: chapterInfo.url,
    scrapedAt: new Date().toISOString(),
    memberCount: members.length,
    members,
  };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  const results = [];

  for (const chapter of chapters) {
    const data = await scrapeChapter(page, chapter);
    if (data) results.push(data);
    await page.waitForTimeout(800);
  }

  await browser.close();

  const output = {
    region: 'BNI Paris Rive Droite',
    scrapedAt: new Date().toISOString(),
    totalChapters: results.length,
    totalMembers: results.reduce((sum, c) => sum + c.memberCount, 0),
    chapters: results,
  };

  fs.writeFileSync('bni_members.json', JSON.stringify(output, null, 2), 'utf-8');

  console.log(`\n========================================`);
  console.log(`Saved ${results.length} chapitres, ${output.totalMembers} membres total`);
  console.log(`========================================`);
  results.forEach(r => console.log(`  ${r.chapterName.padEnd(40)} ${r.memberCount} membres`));
}

main().catch(console.error);
