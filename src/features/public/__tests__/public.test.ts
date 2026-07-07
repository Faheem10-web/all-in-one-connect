// Mock operational hours calculator logic for tests
function calculateIsOpen(
  hours: Array<{ day: string; open: string; close: string; closed: boolean }>,
  currentDay: string,
  currentTime: string, // "HH:MM"
): boolean {
  const todayHours = hours.find((h) => h.day === currentDay);
  if (!todayHours || todayHours.closed) {
    return false;
  }

  const [currentH, currentM] = currentTime.split(":").map(Number);
  const currentMinutes = currentH * 60 + currentM;

  const [openH, openM] = todayHours.open.split(":").map(Number);
  const [closeH, closeM] = todayHours.close.split(":").map(Number);

  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
}

describe("Public Experience - Operating Hours Checker", () => {
  const mockHours = [
    { day: "Monday", open: "09:00", close: "17:00", closed: false },
    { day: "Sunday", open: "10:00", close: "14:00", closed: true },
  ];

  it("should report closed if today is Sunday (closed: true)", () => {
    const isOpen = calculateIsOpen(mockHours, "Sunday", "12:00");
    expect(isOpen).toBe(false);
  });

  it("should report open on Monday during business hours (e.g. 11:30)", () => {
    const isOpen = calculateIsOpen(mockHours, "Monday", "11:30");
    expect(isOpen).toBe(true);
  });

  it("should report closed on Monday before open time (e.g. 08:30)", () => {
    const isOpen = calculateIsOpen(mockHours, "Monday", "08:30");
    expect(isOpen).toBe(false);
  });

  it("should report closed on Monday after close time (e.g. 18:00)", () => {
    const isOpen = calculateIsOpen(mockHours, "Monday", "18:00");
    expect(isOpen).toBe(false);
  });
});
