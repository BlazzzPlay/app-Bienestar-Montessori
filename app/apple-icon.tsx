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
        background: "#0B2545",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#DDA11E",
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
