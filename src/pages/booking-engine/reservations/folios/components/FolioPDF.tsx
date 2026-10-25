// src/components/FolioPDF.tsx
import React from "react";
import moment from "moment-timezone";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { IProperty } from "types/property";
import { IChargeResponse } from "types/charges";
import { IReservationResponse } from "types/reservationTypes";
import { IPaymentResponse, ISimpleFolio } from "types/payments";
import { appConfig } from "config/app.config";
import { chargeIsAdjustment } from "utils/charges";
import { capitalizeFirst } from "utils/helperFunctions/strings";
import { PaymentTotalsData } from "components/ui/PaymentTotals/PaymentTotals";
import { getCurrentRoom } from "utils/reservations";
import { apiAmountToNumber } from "utils/dataFormats";
import { ALL_FOLIOS_KEY } from "constants/ui/folios";

const styles = StyleSheet.create({
  boldText: {
    fontWeight: "bold",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  reservationInfoContainer: {
    display: "flex",
    flexDirection: "row",
    marginTop: "48px",
    marginBottom: "24px",
    fontSize: "10px",
  },
  reservationInfo: {
    marginRight: "128px",
  },
  headerPropertyInfo: {
    fontSize: "10px",
  },
  headerPropertyImage: {
    height: "55px",
    border: "1px solid #fff",
    backgroundColor: "#fff",
  },
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
  table: {
    width: "auto",
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
  },
  tableHeaderColWide: {
    flex: 4,
    padding: 4,
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  tableCol: {
    flex: 1,
    padding: 4,
  },
  tableColWide: {
    flex: 4,
    padding: 4,
  },
  tableCell: {
    fontSize: 10,
  },
  textAlignRight: {
    textAlign: "right",
  },
  textAlignCenter: {
    textAlign: "center",
  },
  tableSpacer: {
    marginTop: "12px",
    margintBottom: "12px",
  },
  reservationLineItem: {
    marginTop: "3px",
  },
  mainTable: {
    marginTop: "24px",
  },
  tableBorder: {
    borderTop: "1px",
    borderBottom: "1px",
    borderLeft: "1px",
    borderRight: "1px",
    borderTopColor: "#e0e0e0",
    borderBottomColor: "#e0e0e0",
    borderLeftColor: "#e0e0e0",
    borderRightColor: "#e0e0e0",
  },
  summaryHeader: {
    fontSize: 10,
    marginBottom: 8,
    marginTop: 12,
  },
  signatureArea: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 32,
  },
  signatureTextContainer: {
    display: "flex",
    alignItems: "center",
    marginRight: 12,
  },
  signatureText: {
    fontSize: 10,
  },
  signatureBox: {
    border: "1px",
    borderColor: "#000",
    width: 300,
    height: 80,
  },
  dateArea: {
    display: "flex",
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  dateAreaLabel: {
    marginRight: 8,
  },
  dateAreaText: {
    fontSize: 10,
  },
  dateAreaLine: {
    borderBottom: "1px",
    borderColor: "#000",
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    width: 100,
    height: 20,
    fontSize: 10,
  },
  footer: {
    borderTopWidth: "1px",
    borderColor: "#000",
    textAlign: "center",
    marginTop: 50,
    paddingTop: 20,
    fontSize: 10,
  },
  footerText: {
    fontStyle: "italic",
  },
});

interface FolioPDFInfoItem {
  label: string;
  value?: string | null;
}

interface FolioPDFInfoSection {
  info: FolioPDFInfoItem[];
}

interface FolioPDFProps {
  tableData: any[];
  folio?: ISimpleFolio;
  property?: IProperty;
  reservation?: IReservationResponse;
  totals: PaymentTotalsData;
  includeFolioColumn?: boolean;
  infoSections?: FolioPDFInfoSection[];
}

const FolioPDF: React.FC<FolioPDFProps> = ({
  tableData,
  property,
  reservation,
  folio,
  totals,
  includeFolioColumn,
  infoSections,
}) => {
  const arrivalDate = moment(reservation?.start_date).format(
    appConfig.displayDateFormat
  );
  const departureDate = moment(reservation?.end_date).format(
    appConfig.displayDateFormat
  );
  const roomNo = getCurrentRoom(reservation)?.room_number ?? "Unassigned";
  const numGuests = reservation?.guests.length;
  const chargeTotal = totals.total ?? 0;
  const paidTotal = totals.paidSubtotal ?? 0;
  const balance = totals.balance;
  function isChargeAdjustment(rowItem: any) {
    return chargeIsAdjustment(rowItem) || rowItem.isAdjustmentCharge;
  }
  function displayChargeAmount(rowItem: IChargeResponse) {
    const amountString = +(rowItem.amount ?? 0);
    if (isChargeAdjustment(rowItem)) {
      return `- ${amountString.toFixed(2)}`;
    }
    return amountString > 0 ? `${amountString.toFixed(2)}` : "";
  }
  function displayPaymentAmount(rowItem: any) {
    if (rowItem.payment_amount == null) {
      return "";
    }
    const absAmount = Math.abs(rowItem.payment_amount);
    let amt = absAmount;
    if (rowItem.originalAmount != null) {
      amt = Math.abs(rowItem.originalAmount);
    }
    if (rowItem.isRefund) {
      const absRefundAmount = Math.abs(rowItem.amount);
      return `${absRefundAmount.toFixed(2)}`;
    }
    return `- ${amt.toFixed(2)}`;
  }
  function displayDescription(rowItem: any) {
    if (!rowItem.payment_amount) {
      // this is a charge
      const description = `${rowItem.posting_code.name}${rowItem.description ? ` : ${rowItem.description}` : ""}`;
      if (isChargeAdjustment(rowItem)) {
        return `Adjustment${description ? `: ${description}` : ""}`;
      }
      return description;
    }
    // payment
    const cardBrand = capitalizeFirst(
      rowItem.posting_code?.name.toLowerCase() ?? ""
    );
    const cardLast4 = rowItem.posting_code?.code ?? "XXXX";
    if (rowItem.isRefund) {
      return `Refund to: ${cardBrand} ${cardLast4}`;
    }
    return `${cardBrand} - ${cardLast4}`;
  }
  function displayReference(rowItem: any) {
    if (!rowItem.payment_amount) {
      // charge display
      return rowItem.posting_code.code;
    }
    if ((rowItem as IPaymentResponse).direct_billing_account_id) {
      return "DB";
    }
    // payment display
    const cardBrand = capitalizeFirst(
      rowItem.posting_code?.name.toLowerCase() ?? ""
    );
    return `${cardBrand.slice(0, 4)} `;
  }
  function calculateSummaryData() {
    const rawTotals = tableData.reduce(
      (agg: any, rowItem) => {
        if (rowItem.payment_amount) {
          return agg;
        }
        const charge = rowItem as IChargeResponse;
        const code = charge.posting_code.code;
        let value = apiAmountToNumber(charge.amount) * 100;
        if (isChargeAdjustment(charge)) {
          value = value * -1;
        }
        if (code > 100 && code < 200) {
          agg.room = agg.room + value;
        } else if (code > 200 && code < 300) {
          agg.misc = agg.misc + value;
        } else if (code > 300 && code < 400) {
          agg.food = agg.food + value;
        } else if (code > 400 && code < 500) {
          agg.retail = agg.retail + value;
        } else if (code > 500 && code < 600) {
          agg.service = agg.service + value;
        } else if (code > 600 && code < 700) {
          agg.attractions = agg.attractions + value;
        } else if (code > 900 && code < 1000) {
          agg.payOut = agg.payOut + value;
        }
        return agg;
      },
      {
        room: 0,
        food: 0,
        retail: 0,
        service: 0,
        attractions: 0,
        misc: 0,
        payOut: 0,
      }
    );
    return {
      room: rawTotals.room / 100,
      food: rawTotals.food / 100,
      retail: rawTotals.retail / 100,
      service: rawTotals.service / 100,
      attractions: rawTotals.attractions / 100,
      misc: rawTotals.misc / 100,
      payOut: rawTotals.payOut / 100,
    };
  }
  const summaryData = calculateSummaryData();
  const dateNow = moment(new Date())
    .tz(property?.timezone ?? "America/Los_Angeles")
    .format(appConfig.displayDateFormat);
  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="portrait">
        <View style={styles.header}>
          <View style={styles.headerPropertyInfo}>
            <Text>{property?.name}</Text>
            <Text>{property?.address_1}</Text>
            <Text>{property?.country}</Text>
            <Text>{property?.phone}</Text>
          </View>
          <View>
            <Image style={styles.headerPropertyImage} src={property?.logo} />
          </View>
        </View>
        {(!!reservation) && (
          <View style={styles.reservationInfoContainer}>
            <View style={styles.reservationInfo}>
              <Text
                style={styles.reservationLineItem}
              >{`Guest Name: ${reservation?.reservation_first_guest_info?.last_name}, ${reservation?.reservation_first_guest_info?.first_name}`}</Text>
              <Text
                style={styles.reservationLineItem}
              >{`Reservation Id: ${reservation?.id}`}</Text>
              <Text
                style={styles.reservationLineItem}
              >{`Confirmation No: ${reservation?.confirmation_id}`}</Text>
              <Text
                style={styles.reservationLineItem}
              >{`Folio: ${folio?.type === ALL_FOLIOS_KEY ? "A to Z" : folio?.type}`}</Text>
            </View>
            <View style={styles.reservationInfo}>
              <Text
                style={styles.reservationLineItem}
              >{`Arrival Date: ${arrivalDate} ${reservation?.checkin_time ?? ""}`}</Text>
              <Text
                style={styles.reservationLineItem}
              >{`Departure Date: ${departureDate} ${reservation?.checkout_time ?? ""}`}</Text>
              <Text
                style={styles.reservationLineItem}
              >{`No. Of Guests: ${numGuests}`}</Text>
              <Text
                style={styles.reservationLineItem}
              >{`Room Number: ${roomNo}`}</Text>
            </View>
          </View>
        )}
        {infoSections && (
          <View style={styles.reservationInfoContainer}>
            {infoSections.map((section, sectionIndex) => (
              <View key={sectionIndex} style={styles.reservationInfo}>
                {section.info.map((item, itemIndex) => (
                  <Text
                    key={itemIndex}
                    style={styles.reservationLineItem}
                  >{`${item.label}: ${item.value}`}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <View style={{ ...styles.summaryHeader, ...styles.textAlignCenter }}>
            <Text>EXPENSE SUMMARY</Text>
          </View>
          <View style={{ ...styles.table, ...styles.tableBorder }}>
            {/* Table Header */}
            <View style={styles.tableHeaderRow}>
              <View
                style={{ ...styles.tableHeaderCol, ...styles.textAlignCenter }}
              >
                <Text style={styles.tableHeaderText}>Rm/Tx</Text>
              </View>
              <View
                style={{ ...styles.tableHeaderCol, ...styles.textAlignCenter }}
              >
                <Text style={styles.tableHeaderText}>Food/Bev</Text>
              </View>
              <View
                style={{ ...styles.tableHeaderCol, ...styles.textAlignCenter }}
              >
                <Text style={styles.tableHeaderText}>Retail</Text>
              </View>
              <View
                style={{ ...styles.tableHeaderCol, ...styles.textAlignCenter }}
              >
                <Text style={styles.tableHeaderText}>Vlt/Services</Text>
              </View>
              <View
                style={{ ...styles.tableHeaderCol, ...styles.textAlignCenter }}
              >
                <Text style={styles.tableHeaderText}>Attract.</Text>
              </View>
              <View
                style={{ ...styles.tableHeaderCol, ...styles.textAlignCenter }}
              >
                <Text style={styles.tableHeaderText}>PayOut</Text>
              </View>
              <View
                style={{ ...styles.tableHeaderCol, ...styles.textAlignCenter }}
              >
                <Text style={styles.tableHeaderText}>Misc</Text>
              </View>
              <View
                style={{ ...styles.tableHeaderCol, ...styles.textAlignCenter }}
              >
                <Text style={styles.tableHeaderText}>Total</Text>
              </View>
              <View
                style={{ ...styles.tableHeaderCol, ...styles.textAlignCenter }}
              >
                <Text style={styles.tableHeaderText}>Payment</Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={{ ...styles.tableCol, ...styles.textAlignCenter }}>
                <Text style={styles.tableCell}>
                  {summaryData.room.toFixed(2)}
                </Text>
              </View>
              <View style={{ ...styles.tableCol, ...styles.textAlignCenter }}>
                <Text style={styles.tableCell}>
                  {summaryData.food.toFixed(2)}
                </Text>
              </View>
              <View style={{ ...styles.tableCol, ...styles.textAlignCenter }}>
                <Text style={styles.tableCell}>
                  {summaryData.retail.toFixed(2)}
                </Text>
              </View>
              <View style={{ ...styles.tableCol, ...styles.textAlignCenter }}>
                <Text style={styles.tableCell}>
                  {summaryData.service.toFixed(2)}
                </Text>
              </View>
              <View style={{ ...styles.tableCol, ...styles.textAlignCenter }}>
                <Text style={styles.tableCell}>
                  {summaryData.attractions.toFixed(2)}
                </Text>
              </View>
              <View style={{ ...styles.tableCol, ...styles.textAlignCenter }}>
                <Text style={styles.tableCell}>
                  {summaryData.payOut.toFixed(2)}
                </Text>
              </View>
              <View style={{ ...styles.tableCol, ...styles.textAlignCenter }}>
                <Text style={styles.tableCell}>
                  {summaryData.misc.toFixed(2)}
                </Text>
              </View>
              <View style={{ ...styles.tableCol, ...styles.textAlignCenter }}>
                <Text style={styles.tableCell}>{chargeTotal.toFixed(2)}</Text>
              </View>
              <View style={{ ...styles.tableCol, ...styles.textAlignCenter }}>
                <Text style={styles.tableCell}>{paidTotal.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ ...styles.section, ...styles.mainTable }}>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeaderRow}>
              <View style={styles.tableHeaderCol}>
                <Text style={styles.tableHeaderText}>Date</Text>
              </View>
              {includeFolioColumn && (
                <View
                  style={{
                    ...styles.tableHeaderCol,
                    ...styles.textAlignCenter,
                  }}
                >
                  <Text style={styles.tableHeaderText}>Folio</Text>
                </View>
              )}
              <View style={styles.tableHeaderCol}>
                <Text style={styles.tableHeaderText}>Reference</Text>
              </View>
              <View style={styles.tableHeaderColWide}>
                <Text style={styles.tableHeaderText}>Description</Text>
              </View>
              <View style={styles.tableHeaderCol}>
                <Text style={styles.tableHeaderText}>{"Charges (USD)"}</Text>
              </View>
              <View style={styles.tableHeaderCol}>
                <Text style={styles.tableHeaderText}>{"Credits (USD)"}</Text>
              </View>
            </View>

            {/* Table Body */}
            {tableData.map((item: any, index: number) => (
              <View
                style={styles.tableRow}
                key={`charge-${item.id}-idx-${index}`}
              >
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    {moment(item.date).format(appConfig.displayDateFormat)}
                  </Text>
                </View>
                {includeFolioColumn && (
                  <View
                    style={{ ...styles.tableCol, ...styles.textAlignCenter }}
                  >
                    <Text style={styles.tableCell}>
                      {item.folioLabel || ""}
                    </Text>
                  </View>
                )}
                <View style={{ ...styles.tableCol, ...styles.textAlignCenter }}>
                  <Text style={styles.tableCell}>{displayReference(item)}</Text>
                </View>
                <View style={styles.tableColWide}>
                  <Text style={styles.tableCell}>
                    {displayDescription(item)}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text
                    style={{ ...styles.tableCell, ...styles.textAlignRight }}
                  >
                    {item.payment_amount != null
                      ? ""
                      : displayChargeAmount(item)}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text
                    style={{ ...styles.tableCell, ...styles.textAlignRight }}
                  >
                    {displayPaymentAmount(item)}
                  </Text>
                </View>
              </View>
            ))}
            <View style={styles.tableSpacer}></View>
            <View style={styles.tableRow}>
              <View style={styles.tableCol}></View>
              <View style={styles.tableCol}></View>
              <View style={styles.tableColWide}>
                <Text style={styles.tableCell}>**Total</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={{ ...styles.tableCell, ...styles.textAlignRight }}>
                  {chargeTotal.toFixed(2)}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={{ ...styles.tableCell, ...styles.textAlignRight }}>
                  {paidTotal === 0
                    ? paidTotal.toFixed(2)
                    : `- ${paidTotal.toFixed(2)}`}
                </Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableCol}></View>
              <View style={styles.tableCol}></View>
              <View style={styles.tableColWide}>
                <Text style={styles.tableCell}>***Balance</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={{ ...styles.tableCell, ...styles.textAlignRight }}>
                  {balance.toFixed(2)}
                </Text>
              </View>
              <View style={styles.tableCol}></View>
            </View>
          </View>
        </View>
        <View style={styles.signatureArea}>
          <View style={styles.signatureTextContainer}>
            <Text style={styles.signatureText}>
              I agree to pay all charges shown above
            </Text>
          </View>
          <View style={styles.signatureBox}></View>
        </View>
        <View style={styles.dateArea}>
          <View style={styles.dateAreaLabel}>
            <Text style={styles.dateAreaText}>Date</Text>
          </View>
          <View style={styles.dateAreaLine}>
            <Text>{dateNow}</Text>
          </View>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for your business!{"\r"}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default FolioPDF;
