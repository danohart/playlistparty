export default function Emojis() {
  const allowedEmojis = [
    "🐵",
    "🐶",
    "🦊",
    "🐱",
    "🦁",
    "🦄",
    "🐷",
    "🐹",
    "🐰",
    "🐨",
    "🐸",
  ];
  const randomEmoji = [...allowedEmojis][
    Math.floor(Math.random() * allowedEmojis.length)
  ];

  return randomEmoji;
}
