import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { IHousekeeperBoard, ITask } from "types/houseKeeperTypes";
import { IRoomTypes } from "types/roomTypes";
import { getMoment } from "utils/helperFunctions/common";

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 15,
    fontSize: 8,
    fontFamily: "Helvetica",
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  propertyName: {
    fontSize: 10,
    fontWeight: "bold",
  },
  loggedInUser: {
    fontSize: 10,
    fontWeight: "bold",
  },
  dateTime: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "right",
  },
  infoSection: {
    marginBottom: 10,
    alignItems: "center",
  },
  boardInfo: {
    fontSize: 11,
    textAlign: "center",
  },
  title: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 3,
  },
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#CCCCCC",
  },
  tableRow: {
    flexDirection: "row",
    minHeight: 18,
    alignItems: "stretch",
  },
  mainHeader: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 6.5,
    backgroundColor: "#ADD8E6",
    color: "black",
    borderStyle: "solid",
    borderColor: "#FFFFFF",
    borderRightWidth: 1,
    borderBottomWidth: 1,
    padding: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  subHeader: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 6,
    backgroundColor: "#ADD8E6",
    color: "black",
    borderStyle: "solid",
    borderColor: "#FFFFFF",
    borderRightWidth: 1,
    borderBottomWidth: 1,
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  tableCol: {
    textAlign: "center",
    fontSize: 7,
    padding: 2,
    borderStyle: "solid",
    borderColor: "#CCCCCC",
    borderRightWidth: 1,
    borderBottomWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
});

interface BoardListPDFProps {
  boardList: IHousekeeperBoard[];
  propertyName: string;
  userName: string;
  appName?: string;
  timezone?: string;
  roomTypeList?: IRoomTypes[];
}

// Helper function to chunk an array into groups (25 rows per page for better utilization)
const chunkArray = (arr: any[], size: number) => {
  return arr.reduce((acc, _, i) => {
    if (i % size === 0) acc.push(arr.slice(i, i + size));
    return acc;
  }, [] as any[][]);
};

const getRoomTypeById = (
  roomTypeList: IRoomTypes[] | undefined,
  roomTypeId: number
) => {
  if (!roomTypeList) return "";
  const roomType = roomTypeList.find((type) => type.id === roomTypeId);
  return roomType ? roomType.type : "";
};

const HousekeeperBoardPDF: React.FC<BoardListPDFProps> = ({
  boardList,
  propertyName,
  userName,
  appName,
  timezone,
  roomTypeList,
}) => {
  let currentPage = 1;

  // Filter out boards with no tasks to avoid blank pages
  const boardsWithTasks = boardList.filter(
    (board) => board.tasks && board.tasks.length > 0
  );

  // Early return if no boards have tasks
  if (boardsWithTasks.length === 0) {
    return (
      <Document>
        <Page size="A4" style={styles.page} orientation="landscape">
          <View style={styles.infoSection}>
            <Text style={styles.boardInfo}>No tasks set.</Text>
          </View>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      {boardsWithTasks.map((board, boardIndex) => {
        const taskChunks = chunkArray(board.tasks, 25);
        const totalPages = boardsWithTasks.reduce((total, b) => {
          const chunks = chunkArray(b.tasks, 25);
          return total + chunks.length;
        }, 0);
        const housekeeperName = board.housekeeper?.first_name || "Unknown";
        const housekeeperId = board.housekeeper?.id || "Unknown";

        // Filter out empty chunks
        return taskChunks
          .filter((chunk: any) => chunk && chunk.length > 0)
          .map((taskChunk: any, chunkIndex: number) => {
            const pageNumber = currentPage++;
            return (
              <Page
                key={`${boardIndex}-${chunkIndex}`}
                size="A4"
                style={styles.page}
                orientation="landscape"
              >
                <View style={styles.headerSection}>
                  <View>
                    <Text style={styles.propertyName}>{propertyName}</Text>
                    <Text style={styles.loggedInUser}>{userName}</Text>
                    {!!appName && (
                      <Text style={styles.loggedInUser}>{`(${appName})`}</Text>
                    )}
                  </View>
                  <Text style={styles.dateTime}>
                    {getMoment(null, timezone).format("DD-MMM-YY hh:mm A")} Page{" "}
                    {pageNumber} of {totalPages}
                  </Text>
                </View>

                {/* Info Section */}
                <View style={styles.infoSection}>
                  <Text style={styles.boardInfo}>
                    Attendant Cleaning Assignment Sheet
                  </Text>
                  <Text style={styles.boardInfo}>
                    <Text>{`For: ${board.shift.name}    `}</Text>
                    <Text
                      style={{ marginLeft: 10 }}
                    >{`Board: ${board.id}`}</Text>
                  </Text>
                  <Text style={styles.boardInfo}>
                    Attendant: {housekeeperName} (ID: {housekeeperId})
                  </Text>
                  <Text style={styles.title}>
                    Ordered by Room Number Ascending
                  </Text>
                </View>

                <View style={styles.table}>
                  {/* Main Headers */}
                  <View style={styles.tableRow}>
                    <Text style={[styles.mainHeader, { width: "20%" }]}>
                      Room
                    </Text>
                    <Text style={[styles.mainHeader, { width: "10%" }]}>
                      Status
                    </Text>
                    <Text style={[styles.mainHeader, { width: "56%" }]}>
                      Reservation
                    </Text>
                    <Text style={[styles.mainHeader, { width: "14%" }]}>
                      Service
                    </Text>
                  </View>

                  {/* Subheaders */}
                  <View style={styles.tableRow}>
                    <Text style={[styles.subHeader, { width: "8%" }]}>
                      Room
                    </Text>
                    <Text style={[styles.subHeader, { width: "8%" }]}>
                      Rm Tp
                    </Text>
                    <Text style={[styles.subHeader, { width: "4%" }]}>Flr</Text>
                    <Text style={[styles.subHeader, { width: "5%" }]}>FD</Text>
                    <Text style={[styles.subHeader, { width: "5%" }]}>HK</Text>
                    <Text style={[styles.subHeader, { width: "14%" }]}>
                      Arrival
                    </Text>
                    <Text style={[styles.subHeader, { width: "14%" }]}>
                      Check-In
                    </Text>
                    <Text style={[styles.subHeader, { width: "14%" }]}>
                      Departure
                    </Text>
                    <Text style={[styles.subHeader, { width: "14%" }]}>
                      Check-Out
                    </Text>
                    <Text style={[styles.subHeader, { width: "9%" }]}>
                      Service Type
                    </Text>
                    <Text style={[styles.subHeader, { width: "5%" }]}>
                      Credits
                    </Text>
                  </View>

                  {/* Data Rows */}
                  {taskChunk.map((task: ITask, taskIndex: number) => (
                    <View
                      key={`${boardIndex}-${chunkIndex}-${taskIndex}`}
                      style={styles.tableRow}
                    >
                      <Text style={[styles.tableCol, { width: "8%" }]}>
                        {task.room.room_number || ""}
                      </Text>
                      <Text style={[styles.tableCol, { width: "8%" }]}>
                        {task.room.room_type?.type ||
                          getRoomTypeById(
                            roomTypeList,
                            task.room.room_type_id
                          ) ||
                          ""}
                      </Text>
                      <Text style={[styles.tableCol, { width: "4%" }]}>
                        {task.room.floor || ""}
                      </Text>
                      <Text style={[styles.tableCol, { width: "5%" }]}>
                        {task.room.frontdesk_status || ""}
                      </Text>
                      <Text style={[styles.tableCol, { width: "5%" }]}>
                        {task.room.housekeeping_status || ""}
                      </Text>
                      <Text style={[styles.tableCol, { width: "14%" }]}>
                        {
                          "" // add in arrival date when backend provides it
                        }
                      </Text>
                      <Text style={[styles.tableCol, { width: "14%" }]}>
                        {task.reservation?.checkin_time
                          ? task.reservation.checkin_time
                          : (task.reservation?.expected_checkin_time ?? "")}
                      </Text>
                      <Text style={[styles.tableCol, { width: "14%" }]}>
                        {
                          "" // add in departure date when backend provides it
                        }
                      </Text>
                      <Text style={[styles.tableCol, { width: "14%" }]}>
                        {task.reservation?.checkout_time
                          ? task.reservation.checkout_time
                          : (task.reservation?.expected_checkout_time ?? "")}
                      </Text>
                      <Text style={[styles.tableCol, { width: "9%" }]}>
                        {task.service_credits?.service_type}
                      </Text>
                      <Text style={[styles.tableCol, { width: "5%" }]}>
                        {task.credits}
                      </Text>
                    </View>
                  ))}
                </View>
              </Page>
            );
          });
      })}
    </Document>
  );
};

export default HousekeeperBoardPDF;
