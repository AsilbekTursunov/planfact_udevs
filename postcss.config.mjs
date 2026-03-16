export default function config(context) {
  if (/\.module\.(s?css|sass)$/i.test(context.file)) {
    return { plugins: {} };
  }
  return {
    plugins: {
      "@tailwindcss/postcss": {},
    },
  };
}
