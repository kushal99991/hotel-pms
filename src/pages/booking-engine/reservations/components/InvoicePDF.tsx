// src/components/InvoiceTablePDF.tsx
import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { InvoiceData } from "types/InvoiceTypes";

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "Helvetica",
  },
  section: {
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  headerText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  title: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 14,
  },
  table: {
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#e0e0e0",
  },
  tableHeaderCol: {
    flex: 1,
    padding: 4,
    borderRightWidth: 1,
    borderColor: "#000",
  },
  tableHeaderText: {
    textAlign: "center",
    fontSize: 10,
    fontWeight: "bold",
  },
  tableCol: {
    flex: 1,
    padding: 4,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  tableCell: {
    textAlign: "center",
    fontSize: 10,
  },
  footer: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 12,
  },
});

interface InvoiceTablePDFProps {
  invoiceData: InvoiceData;
}

const InvoiceTablePDF: React.FC<InvoiceTablePDFProps> = ({ invoiceData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Date: {invoiceData.date}</Text>
        <Text style={styles.title}>
          Grand Canyon Resort Corporation Item List
        </Text>
        <Text style={styles.headerText}>
          Invoice Number: {invoiceData.invoiceNumber}
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeaderRow}>
            <View style={styles.tableHeaderCol}>
              <Text style={styles.tableHeaderText}>
                Item # Description Category Subcat
              </Text>
            </View>
            <View style={styles.tableHeaderCol}>
              <Text style={styles.tableHeaderText}>
                Type Tracking method Unit Preferred unit
              </Text>
            </View>
            <View style={styles.tableHeaderCol}>
              <Text style={styles.tableHeaderText}>
                Acct code Label code Vendor # Taxable
              </Text>
            </View>
            <View style={styles.tableHeaderCol}>
              <Text style={styles.tableHeaderText}>Tax category</Text>
            </View>
            <View style={styles.tableHeaderCol}>
              <Text style={styles.tableHeaderText}>
                Last cost Regular price Item Prc 1
              </Text>
            </View>
            <View style={styles.tableHeaderCol}>
              <Text style={styles.tableHeaderText}>
                Qty on BO Qty on order Qty on lwy Qty on SO
              </Text>
            </View>
            <View style={styles.tableHeaderCol}>
              <Text style={styles.tableHeaderText}>
                Qty on hand Qty on PO Qty committed Qty available
              </Text>
            </View>
            <View style={styles.tableHeaderCol}>
              <Text style={styles.tableHeaderText}>Status</Text>
            </View>
          </View>

          {/* Table Body */}
          {invoiceData.items.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>1-700547</Text>
                <Text style={styles.tableCell}>RED LICORICE BITES</Text>
                <Text style={styles.tableCell}>GOU</Text>
                <Text style={styles.tableCell}>FODSNK</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Inventory</Text>
                <Text style={styles.tableCell}>Normal</Text>
                <Text style={styles.tableCell}>EACH</Text>
                <Text style={styles.tableCell}>EACH</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>RETAIL</Text>
                <Text style={styles.tableCell}></Text>
                <Text style={styles.tableCell}>LEISUR</Text>
                <Text style={styles.tableCell}>Y</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>RETAIL</Text>
                <Text style={styles.tableCell}></Text>
                <Text style={styles.tableCell}>LEISUR</Text>
                <Text style={styles.tableCell}>Y</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>RETAIL</Text>
                <Text style={styles.tableCell}></Text>
                <Text style={styles.tableCell}>LEISUR</Text>
                <Text style={styles.tableCell}>Y</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>RETAIL</Text>
                <Text style={styles.tableCell}></Text>
                <Text style={styles.tableCell}>LEISUR</Text>
                <Text style={styles.tableCell}>Y</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>RETAIL</Text>
                <Text style={styles.tableCell}></Text>
                <Text style={styles.tableCell}>LEISUR</Text>
                <Text style={styles.tableCell}>Y</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>RETAIL</Text>
                <Text style={styles.tableCell}></Text>
                <Text style={styles.tableCell}>LEISUR</Text>
                <Text style={styles.tableCell}>Y</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Text>Thank you for your business!</Text>
      </View>
    </Page>
  </Document>
);

export default InvoiceTablePDF;
