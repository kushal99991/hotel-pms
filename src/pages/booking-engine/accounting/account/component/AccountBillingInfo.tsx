import { Card, CardContent, Typography } from "@mui/material";
import { IDirectBillingAccountResponse } from "types/payments";

interface AccountBillingInfoProps {
  accountDetail?: IDirectBillingAccountResponse | null;
}

const AccountBillingInfo: React.FC<AccountBillingInfoProps> = ({
  accountDetail,
}) => (
  <Card>
    <CardContent>
      <Typography variant="h6">Billing Info</Typography>
      <Typography>Email: {accountDetail?.billing_email || ""}</Typography>
      <Typography>Phone: {accountDetail?.billing_phone || ""}</Typography>
      <Typography>City: {accountDetail?.billing_city || ""}</Typography>
      <Typography>State: {accountDetail?.billing_state || ""}</Typography>
    </CardContent>
  </Card>
);

export default AccountBillingInfo;
