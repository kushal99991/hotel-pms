import React from "react";
import { useParams } from "react-router-dom";
import AccountDetailsView from "./component/AccountDetailsView";

const Page: React.FC = () => {
  const params = useParams();

  return <AccountDetailsView accountId={params.id} />;
};

export default Page;
