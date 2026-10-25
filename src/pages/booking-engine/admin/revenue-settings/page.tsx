"use client";
import * as yup from "yup";
import React, { useState } from "react";
import { Box, Button, Container, Typography, Alert } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import { IRate } from "types/rateTypes";

import RateTable from "./_components/RateTable/RateTable";

const mockRates: IRate[] = [
  {
    name: "Rack Rate",
    code: "RACK",
    description: "Highest rate rooms sold for",
    status: "Active",
  },
  {
    name: "Best Available Rate",
    code: "BAR",
    description: "Best available rate for the day",
    status: "Active",
  },
  {
    name: "AAA Discounted rate",
    code: "AAA",
    description: "10% off BAR Rate",
    status: "Inactive",
  },
  {
    name: "Government",
    code: "GOV",
    description: "8% off BAR Rate",
    status: "Active",
  },
];

const validationSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  code: yup.string().required("Code is required"),
  description: yup.string().required("Description is required"),
  status: yup
    .mixed()
    .oneOf(["Active", "Inactive"])
    .required("Status is required"),
});

const Page: React.FC = () => {
  const [rates, setRates] = useState<IRate[]>(mockRates);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [newRate, setNewRate] = useState<IRate | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [statusError, setStatusError] = useState<string | null>(null);

  const handleStatusChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number
  ) => {
    const { value } = event.target;

    if (value === "Active" || value === "Inactive") {
      setRates((prevRates) =>
        prevRates.map((rate, i) =>
          i === index ? { ...rate, status: value } : rate
        )
      );
      setStatusError(null);
    } else {
      setStatusError(`Invalid status value: ${value}`);
    }
  };

  const handleEditRateChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number
  ) => {
    const { name, value } = event.target;
    setRates((prevRates) =>
      prevRates.map((rate, i) =>
        i === index ? { ...rate, [name]: value } : rate
      )
    );
  };

  const handleAddNewRateChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setNewRate((prevRate) =>
      prevRate
        ? { ...prevRate, [name]: value }
        : {
            name: name === "name" ? value : "",
            code: name === "code" ? value : "",
            description: name === "description" ? value : "",
            status: "Active", // default status
          }
    );
  };

  const handleSaveEditRate = async (index: number) => {
    const rate = rates[index];
    try {
      await validationSchema.validate(rate, { abortEarly: false });
      setEditIndex(null);
      setErrors({});
    } catch (validationErrors) {
      const newErrors: { [key: string]: string } = {};
      (validationErrors as yup.ValidationError).inner.forEach(
        (error: yup.ValidationError) => {
          newErrors[error.path!] = error.message;
        }
      );
      setErrors(newErrors);
    }
  };

  const handleAddNewRate = async () => {
    if (!newRate) return;
    try {
      await validationSchema.validate(newRate, { abortEarly: false });
      setRates((prevRates) => [...prevRates, newRate]);
      setNewRate(null);
      setErrors({});
    } catch (validationErrors) {
      const newErrors: { [key: string]: string } = {};
      (validationErrors as yup.ValidationError).inner.forEach(
        (error: yup.ValidationError) => {
          newErrors[error.path!] = error.message;
        }
      );
      setErrors(newErrors);
    }
  };

  const handleEditClick = (index: number) => {
    if (newRate !== null) return; // Prevent editing while adding a new rate
    setEditIndex(index);
  };

  const handleCancelEditRate = () => {
    setEditIndex(null);
  };

  const handleCancelAddNewRate = () => {
    setNewRate(null);
    setErrors({});
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Rate Code
      </Typography>
      {statusError && <Alert severity="error">{statusError}</Alert>}
      <RateTable
        rates={rates}
        handleStatusChange={handleStatusChange}
        editIndex={editIndex}
        handleEditRateChange={handleEditRateChange}
        handleSaveEditRate={handleSaveEditRate}
        handleEditClick={handleEditClick}
        handleCancelEditRate={handleCancelEditRate}
        errors={errors}
        newRate={newRate}
        handleAddNewRateChange={handleAddNewRateChange}
        handleSaveNewRate={handleAddNewRate}
        handleCancelAddNewRate={handleCancelAddNewRate}
      />
      <Box mt={2} display="flex" justifyContent="flex-start">
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() =>
            setNewRate({
              name: "",
              code: "",
              description: "",
              status: "Active",
            })
          }
          disabled={newRate !== null || editIndex !== null} // Disable while adding or editing
        >
          Add new
        </Button>
      </Box>
    </Container>
  );
};

export default Page;
