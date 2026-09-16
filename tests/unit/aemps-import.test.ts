import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const script = readFileSync('scripts/import-aemps-nomenclator.ps1', 'utf8');

describe('AEMPS importer safeguards', () => {
  it('creates PENDING_REVIEW records only', () => {
    expect(script).toContain("state = 'PENDING_REVIEW'");
    expect(script).toContain("publication_guard = 'PENDING_REVIEW_ONLY'");
    expect(script).not.toContain("state = 'PUBLISHED'");
  });

  it('records source versions and evidence hashes', () => {
    expect(script).toContain('archive_sha256');
    expect(script).toContain('legal_notice_sha256');
    expect(script).toContain('source_data_date');
    expect(script).toContain('technical_sheet_url');
  });

  it('does not parse or create clinical recommendations', () => {
    expect(script).not.toContain('dose_recommendations');
    expect(script).not.toContain('infusion_recommendations');
    expect(script).not.toContain('state = \'PUBLISHED\'');
  });
});
