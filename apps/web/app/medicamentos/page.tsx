import { regulatoryProducts, regulatoryRelease } from '@exacta7/knowledge/regulatory';
import { MedicineDirectory } from '../../components/medicine-directory';
export const metadata = { title: 'Vademécum veterinario AEMPS' };
export default function Medicines() {
  const products = regulatoryProducts.map(({ slug, name, registrationNumber, activeSubstances, species, routes, marketingStatus }) => ({ slug, name, registrationNumber, activeSubstances, species, routes, marketingStatus }));
  return <MedicineDirectory products={products} release={regulatoryRelease.release}/>;
}
