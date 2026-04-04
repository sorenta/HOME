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
          background: "#8f959d",
          borderRadius: "128px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            color: "#ffffff",
            fontSize: 170,
            fontWeight: 900,
            letterSpacing: "-0.04em",
            fontFamily: "Inter, Arial, sans-serif",
          }}
        >
          H:O
        </div>
      </div>
    ),
    size,
  );
}