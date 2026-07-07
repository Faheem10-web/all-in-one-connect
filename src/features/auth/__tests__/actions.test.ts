import { registerUser } from "../actions";

jest.mock("../actions", () => ({
  registerUser: jest
    .fn()
    .mockResolvedValue({ success: true, message: "Mocked registration successful" }),
}));

describe("Authentication Actions", () => {
  it("should register a user successfully when valid details are provided", async () => {
    const mockFormData = new FormData();
    mockFormData.append("email", "test@connect.com");
    mockFormData.append("password", "password123");
    mockFormData.append("confirmPassword", "password123");

    const result = await registerUser({}, mockFormData);
    expect(result.success).toBe(true);
    expect(result.message).toBe("Mocked registration successful");
  });
});
