const fs = require('fs');
const data = require('./bni_members.json');

// BNI Spheres as provided
const BNI_SPHERES = [
  "Communication",
  "Informatique Télécom",
  "Finances",
  "Conseil et service aux entreprises",
  "RH Formation",
  "Immobilier",
  "Construction Bâtiment",
  "Vente et services aux particuliers",
  "Bien être"
];

// Category → BNI Sphere mapping
const CATEGORY_TO_SPHERE = {
  "Publicité et Marketing":                "Communication",
  "Art et Divertissements":                "Communication",
  "Services événementiels et commerciaux": "Communication",
  "Informatique et Programmation":         "Informatique Télécom",
  "Finance et Assurances":                 "Finances",
  "Conseils":                              "Conseil et service aux entreprises",
  "Juridique et Comptabilité":             "Conseil et service aux entreprises",
  "Formation et Coaching":                 "RH Formation",
  "Emploi / Recrutement":                  "RH Formation",
  "Immobilier":                            "Immobilier",
  "Batiment / BTP / Construction":         "Construction Bâtiment",
  "Architecture et Ingénierie":            "Construction Bâtiment",
  "Vente au détail":                       "Vente et services aux particuliers",
  "Services aux personnes":                "Vente et services aux particuliers",
  "Nourriture et Boissons":               "Vente et services aux particuliers",
  "Voyage":                                "Vente et services aux particuliers",
  "Sécurité":                              "Vente et services aux particuliers",
  "Santé et Bien-être":                    "Bien être",
};

// Profession-level overrides: accounting goes to Finances, not Conseil
const PROFESSION_SPHERE_OVERRIDES = {
  "Expertise-comptable":                   "Finances",
  "Commissaire de justice":                "Conseil et service aux entreprises",
  "Notaire":                               "Conseil et service aux entreprises",
};

function getSphere(member) {
  // Check profession-level override first
  if (PROFESSION_SPHERE_OVERRIDES[member.professionSpecialty]) {
    return PROFESSION_SPHERE_OVERRIDES[member.professionSpecialty];
  }
  if (PROFESSION_SPHERE_OVERRIDES[member.professionSubcategory]) {
    return PROFESSION_SPHERE_OVERRIDES[member.professionSubcategory];
  }
  // Fall back to category mapping
  return CATEGORY_TO_SPHERE[member.professionCategory] || "Autre";
}

// Enrich each member with their BNI sphere
data.chapters.forEach(ch => {
  ch.members.forEach(m => {
    m.bniSphere = getSphere(m);
  });
});

// Add metadata
data.bniSpheres = BNI_SPHERES;
data.categoryToSphere = CATEGORY_TO_SPHERE;

// Compute sphere stats per chapter and globally
const globalSphereStats = {};
BNI_SPHERES.forEach(s => globalSphereStats[s] = 0);

data.chapters.forEach(ch => {
  const chapterSpheres = {};
  BNI_SPHERES.forEach(s => chapterSpheres[s] = 0);
  ch.members.forEach(m => {
    if (m.bniSphere) {
      globalSphereStats[m.bniSphere] = (globalSphereStats[m.bniSphere] || 0) + 1;
      chapterSpheres[m.bniSphere] = (chapterSpheres[m.bniSphere] || 0) + 1;
    }
  });
  ch.sphereStats = chapterSpheres;
});

data.globalSphereStats = globalSphereStats;

fs.writeFileSync('bni_members.json', JSON.stringify(data, null, 2), 'utf-8');

console.log('✓ JSON enriched with BNI spheres');
console.log('\nGlobal sphere distribution:');
Object.entries(globalSphereStats).sort((a,b) => b[1]-a[1]).forEach(([s,n]) => {
  const pct = ((n/data.totalMembers)*100).toFixed(1);
  console.log(`  ${s.padEnd(40)} ${n} membres (${pct}%)`);
});
