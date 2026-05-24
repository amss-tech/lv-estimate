import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#111" },
  header: { marginBottom: 24 },
  companyName: { fontSize: 18, fontWeight: "bold", marginBottom: 2 },
  sectionLabel: { fontSize: 8, textTransform: "uppercase", letterSpacing: 1, color: "#666", marginBottom: 4, marginTop: 16 },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#555", marginBottom: 2 },
  divider: { borderBottomWidth: 1, borderBottomColor: "#ddd", marginVertical: 12 },
  tableHeader: { flexDirection: "row", backgroundColor: "#f5f5f5", padding: "4 8", fontWeight: "bold", fontSize: 9 },
  tableRow: { flexDirection: "row", padding: "3 8", borderBottomWidth: 1, borderBottomColor: "#eee" },
  col1: { flex: 1 },
  col2: { width: 40, textAlign: "center" },
  col3: { width: 40, textAlign: "center" },
  col4: { width: 60, textAlign: "right" },
  col5: { width: 70, textAlign: "right" },
  sectionTitle: { fontSize: 11, fontWeight: "bold", backgroundColor: "#f0f0f0", padding: "4 8", marginTop: 10 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", padding: "2 0" },
  totalsMuted: { color: "#555" },
  totalsBold: { fontWeight: "bold", fontSize: 12 },
  totalsBox: { marginTop: 20, borderTopWidth: 2, borderTopColor: "#111", paddingTop: 8, width: 220, alignSelf: "flex-end" },
  terms: { marginTop: 20, color: "#555", lineHeight: 1.5 },
});

interface LineItem {
  id: string;
  section_id: string | null;
  name: string;
  quantity: number;
  unit: string;
  unit_price: number;
}

interface Section {
  id: string;
  name: string;
  sort_order: number;
}

interface Props {
  title: string;
  customerName?: string;
  siteName?: string;
  siteAddress?: string;
  validUntil?: string;
  terms?: string;
  sections: Section[];
  lineItems: LineItem[];
  overheadPct: number;
  profitPct: number;
  laborRate: number;
  laborHours: number;
  materialCost: number;
  laborCost: number;
  directCost: number;
  overhead: number;
  profit: number;
  sellPrice: number;
}

function fmt(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function SectionItems({ items }: { items: LineItem[] }) {
  return (
    <>
      <View style={styles.tableHeader}>
        <Text style={styles.col1}>Item</Text>
        <Text style={styles.col2}>Qty</Text>
        <Text style={styles.col3}>Unit</Text>
        <Text style={styles.col4}>Unit Price</Text>
        <Text style={styles.col5}>Total</Text>
      </View>
      {items.map((item) => (
        <View key={item.id} style={styles.tableRow}>
          <Text style={styles.col1}>{item.name}</Text>
          <Text style={styles.col2}>{item.quantity}</Text>
          <Text style={styles.col3}>{item.unit}</Text>
          <Text style={styles.col4}>{fmt(item.unit_price)}</Text>
          <Text style={styles.col5}>{fmt(item.unit_price * item.quantity)}</Text>
        </View>
      ))}
    </>
  );
}

export function ProposalPDF({
  title, customerName, siteName, siteAddress, validUntil, terms,
  sections, lineItems,
  overheadPct, profitPct,
  materialCost, laborCost, directCost, overhead, profit, sellPrice,
}: Props) {
  const sortedSections = [...sections].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <Document title={title}>
      <Page size="LETTER" style={styles.page}>
        {/* Company header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>ESTICOMMS</Text>
        </View>

        <View style={styles.divider} />

        {/* Proposal info */}
        <Text style={styles.title}>{title}</Text>
        {customerName && <Text style={styles.subtitle}>{customerName}</Text>}
        {siteName && <Text style={styles.subtitle}>Site: {siteName}{siteAddress ? ` · ${siteAddress}` : ""}</Text>}
        {validUntil && <Text style={styles.subtitle}>Valid until: {new Date(validUntil).toLocaleDateString()}</Text>}

        <View style={styles.divider} />

        {/* Line items by section */}
        <Text style={styles.sectionLabel}>Scope of Work</Text>

        {sortedSections.map((sec) => {
          const items = lineItems.filter((l) => l.section_id === sec.id);
          if (items.length === 0) return null;
          return (
            <View key={sec.id}>
              <Text style={styles.sectionTitle}>{sec.name}</Text>
              <SectionItems items={items} />
            </View>
          );
        })}

        {/* Unsectioned */}
        {(() => {
          const items = lineItems.filter((l) => !l.section_id);
          return items.length > 0 ? <SectionItems items={items} /> : null;
        })()}

        {/* Totals */}
        <View style={styles.totalsBox}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsMuted}>Material Cost</Text>
            <Text style={styles.totalsMuted}>{fmt(materialCost)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsMuted}>Labor Cost</Text>
            <Text style={styles.totalsMuted}>{fmt(laborCost)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsMuted}>Overhead ({overheadPct}%)</Text>
            <Text style={styles.totalsMuted}>{fmt(overhead)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsMuted}>Profit ({profitPct}%)</Text>
            <Text style={styles.totalsMuted}>{fmt(profit)}</Text>
          </View>
          <View style={[styles.divider, { marginVertical: 6 }]} />
          <View style={styles.totalsRow}>
            <Text style={styles.totalsBold}>Total</Text>
            <Text style={styles.totalsBold}>{fmt(sellPrice)}</Text>
          </View>
        </View>

        {/* Terms */}
        {terms && (
          <>
            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>Terms & Conditions</Text>
            <Text style={styles.terms}>{terms}</Text>
          </>
        )}
      </Page>
    </Document>
  );
}
