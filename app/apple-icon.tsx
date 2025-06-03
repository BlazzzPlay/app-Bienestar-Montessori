import { ImageResponse } from "next/og"

export const runtime = "edge"

export const size = {
  width: 180,
  height: 180,
}

export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 64,
        background: "linear-gradient(135deg, #005A9C 0%, #004080 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        borderRadius: "22.5%",
      }}
    >
      BM
    </div>,
    {
      ...size,
    },
  )
}
