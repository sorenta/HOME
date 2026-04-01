import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(180deg, rgba(43,49,1,1) 0%, rgba(1,28,38,1) 100%)",
          color: "#ead68b",
          fontSize: 180,
          fontWeight: 700,
        }}
      >
        M
      </div>
    ),
    size,
  );
}
