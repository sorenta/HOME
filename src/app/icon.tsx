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
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000", // Melns fons ir universāls visām tēmām
          borderRadius: "128px", // Maigi noapaļoti stūri
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "80%",
            height: "80%",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)", // Dzintara gradients (mājas siltums)
            color: "#ffffff",
            fontSize: 240,
            fontWeight: 900,
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
          }}
        >
          M
        </div>
      </div>
    ),
    size,
  );
}