import {
  sortByDate,
  isSameDay,
  startOfMonth,
  buildMonthGrid,
} from "./events-planner";

describe("events-planner", () => {
  describe("sortByDate", () => {
    it("sorts items by date ascending", () => {
      const items = [
        { id: "1", date: "2026-05-10" },
        { id: "2", date: "2026-04-01" },
        { id: "3", date: "2026-04-15" },
      ];
      
      const sorted = sortByDate(items);
      expect(sorted[0].id).toBe("2");
      expect(sorted[1].id).toBe("3");
      expect(sorted[2].id).toBe("1");
    });

    it("sorts items by dueDate ascending if date is missing (tasks fallback)", () => {
      const items = [
        { id: "1", dueDate: "2026-05-10" },
        { id: "2", dueDate: "2026-04-01" },
      ];
      
      const sorted = sortByDate(items);
      expect(sorted[0].id).toBe("2");
      expect(sorted[1].id).toBe("1");
    });
  });

  describe("isSameDay", () => {
    it("returns true if JS Date matches ISO date string exactly", () => {
      // 2026. gada aprīlis ir index 3 (JS datumiem mēneši sākas no 0)
      const date = new Date(2026, 3, 8);
      expect(isSameDay(date, "2026-04-08")).toBe(true);
    });

    it("returns false if JS Date does not match ISO string", () => {
      const date = new Date(2026, 3, 8);
      expect(isSameDay(date, "2026-04-09")).toBe(false);
    });
  });

  describe("buildMonthGrid", () => {
    it("builds a correct European grid for April 2026", () => {
      // 2026. gada 1. aprīlis iekrīt Trešdienā.
      // Eiropas kalendārā (Pirmdiena = 1. diena) tas nozīmē, ka Pirmdiena un Otrdiena ir tukšas (null).
      // Kopējais kalendāra tabulas "rūtiņu" skaits tiek noapaļots pilnās nedēļās.
      
      const grid = buildMonthGrid(new Date(2026, 3, 1));
      
      // Ofsets: (Trešdiena(3) + 6) % 7 = 2 tukšas dienas.
      // Kopā aprīlī ir 30 dienas. 30 + 2 = 32. 
      // Apaļots uz augšu pa 7 (nedēļa) = 35.
      expect(grid.length).toBe(35);
      
      // Pirmdiena (0) un Otrdiena (1) ir tukšas
      expect(grid[0]).toBeNull();
      expect(grid[1]).toBeNull();
      
      // Trešdiena (2) ir 1. Aprīlis
      expect(grid[2]?.getDate()).toBe(1);
      expect(grid[2]?.getMonth()).toBe(3);
      
      // Ceturtdiena (31) ir 30. Aprīlis (pēdējā mēneša diena)
      expect(grid[31]?.getDate()).toBe(30);
      
      // Piektdiena(32), Sestdiena(33), Svētdiena(34) no nākamā mēneša ir atstātas tukšas "null"
      expect(grid[32]).toBeNull();
      expect(grid[34]).toBeNull();
    });
  });
});