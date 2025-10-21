/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SearchBar from "@/components/SearchBar/SearchBar";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/components/SearchSuggestions/SearchSuggestions", () => ({
  __esModule: true,
  default: ({
    suggestions,
    onSelect,
  }: {
    suggestions: string[];
    onSelect: (city: string) => void;
  }) => (
    <div data-testid="suggestions">
      {suggestions.map((s) => (
        <button key={s} onClick={() => onSelect(s)}>
          {s}
        </button>
      ))}
    </div>
  ),
}));

jest.mock("@/hooks/useDebounce", () => ({
  useDebounce: jest.fn(),
}));

import { useDebounce } from "@/hooks/useDebounce";

describe("SearchBar component", () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    jest.clearAllMocks();
  });

  test("renders input and icon", () => {
    (useDebounce as jest.Mock).mockReturnValue({ result: [], loading: false });
    render(<SearchBar />);
    expect(
      screen.getByPlaceholderText("Enter city name...")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Search city")).toBeInTheDocument();
  });

  test("shows loading indicator when loading", () => {
    (useDebounce as jest.Mock).mockReturnValue({ result: [], loading: true });
    render(<SearchBar />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("shows 'City not found' when no suggestions", () => {
    (useDebounce as jest.Mock).mockReturnValue({ result: [], loading: false });
    render(<SearchBar />);
    const input = screen.getByLabelText("Search city") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "UnknownCity" } });
    expect(
      screen.getByText("City not found, please try again.")
    ).toBeInTheDocument();
  });

  test("renders suggestions and allows selection", () => {
    const suggestions = ["Kyiv", "Lviv", "Odessa"];
    (useDebounce as jest.Mock).mockReturnValue({
      result: suggestions,
      loading: false,
    });

    render(<SearchBar />);
    const input = screen.getByLabelText("Search city") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "K" } });

    const suggestionsContainer = screen.getByTestId("suggestions");
    expect(suggestionsContainer).toBeInTheDocument();
    expect(screen.getByText("Kyiv")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Kyiv"));
    expect(pushMock).toHaveBeenCalledWith("/weather/Kyiv");
    expect(input.value).toBe("");
  });
});
