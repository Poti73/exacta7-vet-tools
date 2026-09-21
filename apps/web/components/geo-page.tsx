import Link from 'next/link';

type LinkItem = { href: string; label: string };
type Table = { headers: string[]; rows: string[][] };
type Section = { title: string; paragraphs?: string[]; items?: string[]; table?: Table; links?: LinkItem[] };

export function JsonLd({ value }: { value: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(value).replace(/</g, '\\u003c') }} />;
}

export function GeoPage({ eyebrow, title, lead, sections, links = [] }: { eyebrow: string; title: string; lead: string; sections: Section[]; links?: LinkItem[] }) {
  return <>
    <section className="page-intro geo-intro"><p className="eyebrow green">{eyebrow}</p><h1>{title}</h1><p className="lead">{lead}</p></section>
    <div className="geo-content">{sections.map(section => <section key={section.title} className="geo-section"><h2>{section.title}</h2>{section.paragraphs?.map(paragraph => <p key={paragraph}>{paragraph}</p>)}{section.items && <ul>{section.items.map(item => <li key={item}>{item}</li>)}</ul>}{section.table && <div className="plans-comparison"><table><thead><tr>{section.table.headers.map(header => <th key={header} scope="col">{header}</th>)}</tr></thead><tbody>{section.table.rows.map(row => <tr key={row.join('|')}>{row.map((cell, index) => index === 0 ? <th key={cell} scope="row">{cell}</th> : <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></div>}{section.links && <nav className="plans-links" aria-label={section.title}>{section.links.map(link => <Link key={link.href} href={link.href}>{link.label} →</Link>)}</nav>}</section>)}</div>
    {links.length > 0 && <nav className="plans-links geo-links" aria-label="Siguientes pasos">{links.map(link => <Link key={link.href} href={link.href}>{link.label} →</Link>)}</nav>}
  </>;
}
