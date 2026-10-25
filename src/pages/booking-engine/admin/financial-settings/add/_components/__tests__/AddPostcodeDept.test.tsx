import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import AddPostcodeDept from "../AddPostcodeDept";
import TestWrapper from "utils/TestWrapper";
import { useAddPostcodeDeptMutation } from "services/financeSlice";
import { useNavigate } from "react-router-dom";

// Mock the required hooks
jest.mock("services/financeSlice", () => ({
  useAddPostcodeDeptMutation: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("hooks/useAuth", () => ({
  __esModule: true,
  default: () => ({ users: { defaultPropertyId: 1 } }),
}));

describe("AddPostcodeDept Component", () => {
  const mockNavigate = jest.fn();
  const mockAddPostcodeDept = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useAddPostcodeDeptMutation as jest.Mock).mockReturnValue([
      mockAddPostcodeDept,
      { isLoading: false },
    ]);
  });

  const renderComponent = () =>
    render(
      <TestWrapper>
        <AddPostcodeDept />
      </TestWrapper>
    );

  test("renders form fields correctly", () => {
    renderComponent();

    expect(
      screen.getByPlaceholderText("Enter Department Name")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter Department Code")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Save/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Back/i })).toBeInTheDocument();
  });

  test("displays validation error when submitting empty form", async () => {
    renderComponent();

    fireEvent.click(screen.getByRole("button", { name: /Save/i }));

    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeInTheDocument();
      expect(screen.getByText("Code is required")).toBeInTheDocument();
    });
  });

  test("submits form data successfully and navigates on success", async () => {
    mockAddPostcodeDept.mockReturnValue({ data: { id: 1 } });

    renderComponent();

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText("Enter Department Name"), {
      target: { value: "Test Department" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Department Code"), {
      target: { value: "10001" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /Save/i }));

    await waitFor(() => {
      expect(mockAddPostcodeDept).toHaveBeenCalledWith({
        name: "Test Department",
        code: 10001,
        property_id: 1,
      });
      expect(mockNavigate).toHaveBeenCalledWith(
        "/booking-engine/admin/financial-settings/posting-code-departments"
      );
    });
  });
});
