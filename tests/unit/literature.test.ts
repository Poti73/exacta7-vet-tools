import { describe, expect, it } from 'vitest';
import { publicationFromPubMedSummary, rankLiterature } from '../../packages/knowledge/src/literature';

describe('literature: determinista, bibliográfica y no prescriptiva', () => {
  const query = { indication: 'Otitis externa', aliases: ['external otitis', 'otitis externa'], species: 'Perro' as const, limit: 5 };
  it('prioriza tipo bibliográfico y coincidencias explicables, sin recomendar tratamientos', () => {
    const guideline = publicationFromPubMedSummary({ uid: '1', title: 'Otitis externa in dogs: a practice guideline', pubtype: ['Practice Guideline'], sortpubdate: '2024/01/01', hasabstract: true })!;
    const report = publicationFromPubMedSummary({ uid: '2', title: 'External otitis in a dog', pubtype: ['Case Reports'], sortpubdate: '2025/01/01' })!;
    const ranked = rankLiterature([report, guideline], query);
    expect(ranked.map(item => item.pubmedId)).toEqual(['1', '2']);
    expect(ranked[0].why).toContain('Otitis externa');
  });
  it('excluye las publicaciones retractadas de resultados destacados', () => {
    const retracted = publicationFromPubMedSummary({ uid: '3', title: 'Otitis externa in dogs', pubtype: ['Retracted Publication'], sortpubdate: '2024/01/01' })!;
    expect(rankLiterature([retracted], query)).toEqual([]);
  });
  it('no guarda abstracts ni construye consultas a partir de datos de pacientes', () => {
    const publication = publicationFromPubMedSummary({ uid: '4', title: 'Otitis externa in dogs', pubtype: ['Clinical Trial'], sortpubdate: '2020/01/01', hasabstract: true })!;
    expect(publication).not.toHaveProperty('abstract');
    expect(publication.sourceUrl).toBe('https://pubmed.ncbi.nlm.nih.gov/4/');
  });
});
