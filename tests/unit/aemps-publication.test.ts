import{describe,expect,it}from'vitest';
import{regulatoryProducts,regulatoryRelease,toRegulatoryCalculatorProduct}from'../../packages/knowledge/src/regulatory';
import{catalog,createSearch}from'../../packages/knowledge/src/index';
describe('publicación regulatoria AEMPS',()=>{
  it('publica únicamente el conjunto autorizado y resuelto',()=>{
    expect(regulatoryRelease.release.approvalScope).toBe('REGULATORY_DATA_ONLY');
    expect(regulatoryProducts).toHaveLength(3239);
    expect(regulatoryRelease.release.counts).toMatchObject({authorizedProducts:3240,publishedProducts:3239,publishedPresentations:13928,excludedUnresolvedProducts:1});
    expect(regulatoryRelease.release.excludedUnresolvedRegistrationNumbers).toEqual(['EU/2/96/001/003']);
    expect(JSON.stringify(regulatoryProducts)).not.toContain('UNRESOLVED_AEMPS_');
  });
  it('conserva trazabilidad y enlaces oficiales',()=>{
    expect(regulatoryRelease.release.publisher).toContain('AEMPS');
    expect(regulatoryRelease.release.archiveSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(regulatoryProducts.every(item=>item.registrationNumber&&item.technicalSheetUrl.startsWith('https://cimavet.aemps.es/'))).toBe(true);
  });
  it('encuentra marcas, principios activos, especies y vías',()=>{
    const search=createSearch(catalog);
    expect(search('GLUCOSALINO BRAUN')[0]?.group).toBe('MEDICAMENTOS');
    expect(search('GLUCOSA MONOHIDRATO Perros VÍA INTRAVENOSA').length).toBeGreaterThan(0);
  });
  it('solo transfiere a cálculo una concentración escrita por AEMPS',()=>{
    const propofol=regulatoryProducts.find(product=>product.name.startsWith('PROPOFOL LIPURO'));
    expect(propofol).toBeDefined();
    const calculatorProduct=toRegulatoryCalculatorProduct(propofol!);
    expect(calculatorProduct.presentations.length).toBeGreaterThan(0);
    expect(calculatorProduct.presentations.every(item=>item.concentration==='10'&&item.concentrationUnit==='mg/mL')).toBe(true);
    const multiActive=regulatoryProducts.find(product=>product.activeSubstances.length>1)!;
    expect(toRegulatoryCalculatorProduct(multiActive).presentations).toEqual([]);
  });
});
